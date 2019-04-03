import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View, ScrollView,
  Image,
  Alert,
  AsyncStorage,
} from 'react-native';
import { Permissions, Notifications, Constants } from 'expo';
import { List, ListItem, Divider  } from "react-native-elements";



export default class App extends React.Component {

  static navigationOptions = {
    title: "Inicio"
  }

  constructor(props) {
    super(props);
    this.state = {
 
      clave:null,
      notification: null,
      data:null,
      last_notification_id:null,
      listado:[],
      notificaciones:[],
      server: 'http://intranet.exa.unne.edu.ar/alertafacena/public',

    };
  }

  componentDidMount() {
    this.registerForPushNotifications();///registramos la app y obtenemos el token
    this.init();//aca vamos a setear todas los states que necesitemos
    // this.renderNotifications();///render ya llama desde init

  }

  init = async () => {
    try {
      ///get current data
      let data = await AsyncStorage.getItem('status');
      if (data !== null)//ya hay algo cargado?
      {
        if (data == 'true') {
          this.setState({ 'bind': true });
        }
        else {
          this.setState({ 'bind': false });
        }
      }
      else {//es el primero asi que se inicializa  
        AsyncStorage.setItem('status', "false");
      }
    } catch (error) {
      console.log("error init() bind status")
    }

    //user_id

    try {
      let data = await AsyncStorage.getItem('user_id');
      this.setState({ 'user_id': parseInt(data, 10) });
      console.log('User_id:' + this.state.user_id);
    }
    catch{
      console.log("error init() get user_id")
    }


    this.getNotifications();
  }

  vincular = async ()=>{
    ///registro en mi base de datos por api
    data = JSON.stringify({
      token: this.state.token, clave: this.state.clave
    })
    console.log(data);
    // prepraro el envio
    const myRequest = new Request(this.state.server + '/api/registerapp',
      { method: 'POST', body: data });


    fetch(myRequest)

      .then(response => {
        if (response.status === 200) {
          console.log('Response: ');
          _user = JSON.parse(response._bodyText);

          console.log(JSON.parse(response._bodyText));
          this.setState({ 'user': _user });
          AsyncStorage.setItem('user_id', _user.id.toString());
          //  TODO guarda user en storage
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
          this.init();
        }
        else {

          Alert.alert(
            'Expedientes FACENA',
            'Clave Incorrecta, Intente de nuevo',
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
          )
          // console.log(data)
        }
      })

  }///end vincular()
  
  async registerForPushNotifications() {
    // PRIMERO PIDO PERMISO
    
    // Crear Canal
    if (Platform.OS === 'android') {
      Expo.Notifications.createChannelAndroidAsync('notif', {
        name: 'notif',
        sound: true,
        vibrate: [0, 250, 250, 250],
        priority: 'max',
      });
    }

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
    console.log("Tengo el Token");
    console.log(this.state.token);
    }


  // RECIBO NOTIFICACION
  handleNotification = notification => {
   
    // console.log("Handling");
    this.getNotifications();
    this.setState({ notification: notification });

    
  };

  
async serverDelete(notif_id)
{
  ////borrar del servidor tambien
  postdata = JSON.stringify({
    id: notif_id
  })
  const myRequest = new Request(this.state.server + '/api/deleteNotication',
    { method: 'POST', body: postdata });

  fetch(myRequest).then(response => {
    if (response.status === 200) {
      console.log("NOTIFICACION BORRAR")
      console.log(response._bodyText);
    }
    else {
      console.log("No se pudo borrar la notificacion del servidor")
    }
  })
}
  

 
//Borrar Noticaciones
  async borrarNotificacion(notif_id)
  {
    console.log("Borrar"+notif_id)
    try {
      let data = this.state.notificaciones

      if(data !== null)
      {
        // data = JSON.parse(data);

        for (var i = 0; i < data.length; i++) {
          if (data[i].id == notif_id) 
          {
            console.log("BORRAR "+notif_id)
            data.splice(i, 1);
           
          }
        }
        
      }

      this.setState({notificaciones:data});
    

      // AsyncStorage.setItem('notify',JSON.stringify(data));
      this.renderNotifications();
      this.serverDelete(notif_id);


    } catch (error) {
      console.log(error)
      console.log("Borrar notif error")
    }
  }
// render

  getNotifications = async() =>
  {
    
    params = JSON.stringify({ user_id: this.state.user_id });
    console.log(params);
    const requestNotifications = new Request(this.state.server + '/api/getNotifications',
      { method: 'POST', body: params});


    fetch(requestNotifications)
      .then(response => {
        if (response.status === 200) {
       
          respuesta = JSON.parse(response._bodyText);

          console.log('notificaciones');
          // console.log(notificaciones);
          _notificaciones = [];//empty array
          respuesta.forEach(notif => 
          {
            _notificaciones.push({ id: notif.id, data: JSON.parse(notif.mensaje)})
          });


          // AsyncStorage.setItem('notify', JSON.stringify(_notificaciones));
          this.setState({notificaciones:_notificaciones});
          this.renderNotifications();
         
        }
        else {  
          console.log("ERROR EN NOTIFICACIONES")
          console.log(response.status)        ;
          
        }
      })}///end getNotification();
   

  



  renderNotifications =  async() => {
  

      console.log('Render Notifications')
      // notificaciones = await AsyncStorage.getItem('notify');
    notificaciones = this.state.notificaciones;
   
      
      if(notificaciones !== null)
      {
        // notificaciones = JSON.parse(notificaciones);
      }
      else
      {
        notificaciones = [];
      }

      

      let listado =[];
       for (let index = 0; index < notificaciones.length; index++) {
        
    
          listado.push(<ListItem key={'notificacion_' + index}
            title={"Expediente: "+notificaciones[index].data.expediente.numero}
            // rightIcon={}

            subtitle={<View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 90 }}>

              <Text style={{ paddingBottom: 2, padding: 8}}>
                  Detalle: {notificaciones[index].data.expediente.detalle_asunto}
                </Text>
      
              
              <Text style={{paddingBottom: 2,padding: 8}}>
                  Asunto: {notificaciones[index].data.asunto}
              </Text>


              <Text style={{ paddingBottom: 2, padding: 8}}>
                  Fecha: {notificaciones[index].data.expediente.fecha}
              </Text>
              </View>
              <View style={{ flex: 10 }}>
                <TouchableOpacity style={{ textAlign: "center", height:40 }}
                  onPress={() => this.borrarNotificacion(notificaciones[index].id)}>

                  <Image source={require('../assets/delete.png')} style={{ height: "80%", width: "80%" }} />

                </TouchableOpacity>
              </View>
              {/* <Text style={styles.text}>Expediente: {notificaciones[index].data.expediente.numero}</Text> */}
            </View>}
          />)

          listado.push(<Divider key={'divider_' + index} style={{ backgroundColor: 'blue' }} />)
        
         
          
       }
      //  return listado;
  
     listado.reverse();
     this.setState({listado:listado})
     listado = undefined;
  }


  _borrarUser = async () => {
    try {
      AsyncStorage.removeItem('status');
      this.setState({ bind: false })
      console.log('Borrado')
    } catch (error) {
      console.log(error)
    }
  }

  _borrar = async () => {
    try {
      AsyncStorage.removeItem('status');
      AsyncStorage.removeItem('notify');
      AsyncStorage.removeItem('last_notification_id');
      AsyncStorage.removeItem('user_id');
      this.setState({ bind: false })
      console.log('Borrado status')
    } catch (error) {
      console.log(error)
    }
  }
  


  render() {
  
    return (
      
      <View style={styles.padre}>
        {/* <TouchableOpacity
          style={styles.touchable}
          onPress={() => this._borrar()}>
          <Text>Borrar</Text>
        </TouchableOpacity> */}
      <Text style={styles.header}>Expedientes FACENA</Text>
        {/* <Text style={styles.header}>{this.state.server}</Text> */}
   
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
                onPress={() => this.vincular()}
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