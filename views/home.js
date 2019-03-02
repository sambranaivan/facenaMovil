import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  View,
  AsyncStorage,
} from 'react-native';
import { Permissions, Notifications, Constants } from 'expo';


var listado = [];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      clave:null,
      notification: null,
      getStatus:false,
      data:null,
      listado:[]
    };
  }

  componentDidMount() {
    // AppState.addEventListener('change', this._handleAppStateChange);
    this.subscription = Notifications.addListener(this.handleNotification);
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
    // const myRequest = new Request('http://192.168.43.137/facena/api/registerapp',
    // const myRequest = new Request('http://intranet.exa.unne.edu.ar/alertafacena/public/api/registerapp',
    const myRequest = new Request('http://192.168.1.15/facena/api/registerapp',
         {method: 'POST', body: data  });

    // ejectuo el envio
       fetch(myRequest)
         .then(response => {
           if (response.status === 200) {
             console.log('todo ok');
           }
           else{
            console.log(data)
           }
          })
    
    AsyncStorage.setItem('status', "true");
    this.getStatus();

    }


  // RECIBO NOTIFICACION y guardo el objeto
  handleNotification = notification => {
    console.log("Handle Notificatio!!!!n")
    console.log(notification)

    this.setState({
      notification,
    });

    this.almacenar();
  };


  // Almacenar Notificacion

  almacenar = async () => {
    try {
      notificacion = this.state.notification;
      // get current data
      let data = await AsyncStorage.getItem('notificaciones');
      if (data !== null)//ya hay algo cargado?
      {
        //convierto string a objeto !
        var data = JSON.parse(data);
        //inserto nuevo objeto
        data.push(notificacion);
        //convierto de nuevo a string!
        data = JSON.stringify(data);
        //guardo en el coso locol
        AsyncStorage.setItem('notificaciones', data);
        //muestro en consola por la dua
        console.log("notificaciones")
        console.log(data);
      }
      else {//es el primero asi que se inicializa
        data = [];
        data.push(notificacion);
        data = JSON.stringify(data);
        AsyncStorage.setItem('notificaciones', data);
       
        console.log("array de notificaciones")
        console.log(data);
      }
      console.log("Notificacion Almacenada")
      this.updateNotifications();
      
    } catch (error) {
      console.log(error)
    }
  }

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

  _borrar = async () => {
    try {
      AsyncStorage.removeItem('status');
      this.setState({bind:false})
    } catch (error) {
      console.log(error)
    }
  }

// render

  updateNotifications =  async() => {
      let notificaciones = await AsyncStorage.getItem('notificaciones');
      notificaciones = JSON.parse(notificaciones);
      this.setState({notificaciones:notificaciones})
      console.log('this.updateNofications');
      console.log(this.state.notificaciones.length);
      listado =[];
     for (let index = 0; index < notificaciones.length; index++) {
       listado.push(<View key={'notificacion_'+index} ><Text>{notificaciones[index].data.message}</Text></View>)
     }
     this.setState({listado:listado})
  }


  

  

  render() {
  
    return (
      
      <View style={styles.padre}>
      <Text style={styles.header}>Expedientes FACENA</Text>
      {this.state.bind?
        (
              this.state.notification ? (
                // si llega una notificacion

              this.state.notification.data.type == 'test' ?(
                <View>
                  <Text style={styles.text}>Fecha: {this.state.notification.data.type}</Text>
                </View>
                ):(
                <View>
                <Text style={styles.text}>Expediente: {this.state.notification.data.expediente.numero}</Text>
                <Text style={styles.text}>Asunto: {this.state.notification.data.asunto}</Text>
                <Text style={styles.text}>Detalle: {this.state.notification.data.expediente.detalle_asunto}</Text>
                <Text style={styles.text}>Fecha: {this.state.notification.data.expediente.fecha}</Text>
                </View>)
              ) : null
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
        {this.state.listado}
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
    // backgroundColor: '#8fbd4d'

  },
});