import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  View, ScrollView,
  FlatList,
  Alert,
  AsyncStorage,
} from 'react-native';
import { Permissions, Notifications, Constants } from 'expo';
import { List, ListItem, Divider  } from "react-native-elements";
// import { ScrollView } from 'react-native-gesture-handler';
// import { ListItem, Left, Body, Right, Title } from "native-base";

var listado = [];


export default class App extends React.Component {

  static navigationOptions = {
    title: "Inicio"
  }

  constructor(props) {
    super(props);
    this.state = {
      bind:false,
      enlazado:false,
      token: null,
      clave:null,
      notification: null,
      getStatus:false,
      data:null,
      last_notification_id:0,
      listado:[],
       // const myRequest = new Request('http://192.168.43.137/facena/api/registerapp',
    // const myRequest = new Request('http://192.168.1.15/facena/api/registerapp',
      // server: 'http://intranet.exa.unne.edu.ar/alertafacena/public',
      // server: 'http://192.168.1.15/facena',
      server: 'http://192.168.0.16/facena',
      // server: 'http://192.168.43.137/facena'
    };
  }

  componentDidMount() {
    // AppState.addEventListener('change', this._handleAppStateChange);
    // this.subscription = Notifications.addListener(this.handleNotification);
    // guardo la respuesta en local
    this.getStatus();
    this.updateNotifications();

  }

  // registro para notificaciones
  
  async registerForPushNotifications() {
    // PRIMERO PIDO PERMISO
    
    // Crear Canal
    // if (Platform.OS === 'android') {
    //   Expo.Notifications.createChannelAndroidAsync('notif', {
    //     name: 'notif',
    //     sound: true,
    //     vibrate: [0, 250, 250, 250],
    //     priority: 'max',
    //   });
    // }

    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    if (status !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        return;
      }
    }
    // OBTENGO EL TOKEN
    const token = await Notifications.getExpoPushTokenAsync();

    // EVENTO LIsTENER
    this.subscription = Notifications.addListener(this.handleNotification);

    // guardo la respuesta en local
    this.setState({
      token,
    });

    ///registro en mi base de datos por api
      data = JSON.stringify({
        token: this.state.token,clave:this.state.clave
    })
    console.log(data);
    // prepraro el envio
    const myRequest = new Request(this.state.server+'/api/registerapp',
   {method: 'POST', body: data  });


       fetch(myRequest)
        
         .then(response => {
           if (response.status === 200) {
             console.log('Response: ');
             Alert.alert(
               'Expedientes FACENA',
               'Aplicación vinculada con Éxito',
               [
                 { text: 'OK', onPress: () => console.log('OK Pressed') },
               ],
               { cancelable: false }
             )

             AsyncStorage.setItem('status', "true");
             this.setState({ 'bind': true });
           }
           else{
             
             Alert.alert(
               'Expedientes FACENA',
               'Clave Inconrrecta, Intente de nuevo',
               [
                 { text: 'OK', onPress: () => console.log('OK Pressed') },
               ],
               { cancelable: false }
             )
            // console.log(data)
           }
          })
    
   
    this.getStatus();

    }


  // RECIBO NOTIFICACION y guardo el objeto
  handleNotification = notification => {
    console.log("Handle Notificatio!!!!n")
    console.log(notification)

    this.setState({
      notification,
    });

    //this.almacenar();
  };


  

  getStatus = async () => {
    try {

      ///get current data
      let data = await AsyncStorage.getItem('status');
      console.log("GetSTATUS()")
      console.log(data)
      if (data !== null)//ya hay algo cargado?
      {
       
        // AsyncStorage.setItem('data', data);
        if(data == 'true')

        {
          this.setState({'bind':true});
        }
        else
        {
          this.setState({'bind':false});
        }

      }
      else 
      {//es el primero asi que se inicializa  
        AsyncStorage.setItem('status', "false");
      }


    } catch (error) {
      console.log(error)
    }

  }

 

// render

  updateNotifications =  async() => {
    ///TODO consulta a API
      let notificaciones = await AsyncStorage.getItem('notificaciones');
      if(notificaciones !== null)
      {
        notificaciones = JSON.parse(notificaciones);
      }
      else
      {
        notificaciones = [];
      }
      // notificaciones.reverse();
      this.setState({notificaciones:notificaciones})
      // console.log('this.updateNofications');
      console.log(this.state.notificaciones);
      listado =[];
       for (let index = 0; index < notificaciones.length; index++) {
        
        if(notificaciones[index].data.type == 'exp')
        {
          listado.push(<ListItem key={'notificacion_' + index}
            title={"Expediente: "+notificaciones[index].data.expediente.numero}
            // rightIcon={}

            subtitle={<View>
              <Text style={styles.text}>Detalle: {notificaciones[index].data.expediente.detalle_asunto}</Text>
              <Text style={styles.text}>Asunto: {notificaciones[index].data.asunto}</Text>
              <Text style={styles.text}>Fecha: {notificaciones[index].data.expediente.fecha}</Text>
              {/* <Text style={styles.text}>Expediente: {notificaciones[index].data.expediente.numero}</Text> */}
            </View>}
          />)

          listado.push(<Divider key={'divider_' + index} style={{ backgroundColor: 'blue' }} />)
        }
         
          
       }
      //  return listado;
  
     listado.reverse();
     this.setState({listado:listado})
  }


  _borrar = async () => {
    try {
      AsyncStorage.removeItem('status');
      this.setState({ bind: false })
      console.log('Borrado')
    } catch (error) {
      console.log(error)
    }
  }

  


  render() {
  
    return (
      
      <View style={styles.padre}>
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => this._borrar()}>
          <Text>Borrar</Text>
        </TouchableOpacity>
      <Text style={styles.header}>Expedientes FACENA</Text>
   
      {this.state.bind?
        ( 
            <ScrollView>
              {this.state.listado}
            </ScrollView>
        ):
        (
        <View style={styles.vinculacion}>
              <Text style={styles.text}>Clave de Vinculación</Text>
              <TextInput
                style={styles.input}
                onChangeText={clave => this.setState({ clave })}
                maxLength={100}
                value={this.state.clave}
              />
              <TouchableOpacity
                onPress={() => this.registerForPushNotifications()}
                style={styles.touchable}>
                <Text>Registrar Aplicación</Text>
              </TouchableOpacity>
        </View>
      
        )}
      
        
        
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center', // <-- the magic
    fontSize: 20,
    padding: 8,
  },
  text: {
    paddingBottom: 2,
    padding: 8,
  },
  container: {
    flex: 1,
    // paddingTop: 40,
    backgroundColor:"white"
  },
  touchable: {
    borderWidth: 1,
    borderRadius: 4,
    margin: 8,
    padding: 8,
    width: '95%',
  },
  input: {
    height: 40,
    borderWidth: 1,
    margin: 8,
    padding: 8,
    width: '95%',
  },
  header:{
    width:'100%',
    fontSize:24,
    height:40,
    // textAlign: 'center', // <-- the magic
    backgroundColor: '#1e88e5',
    color:'white',
  },
  vinculacion:{
    flex:1,
  },  
  padre: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ffffff'

  },
});