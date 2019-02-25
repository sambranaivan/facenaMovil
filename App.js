import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  View,
  AsyncStorage
} from 'react-native';
import { Permissions, Notifications } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      clave:null,
      notification: null,
      getStatus:false,
      data:null,
    };
  }

  componentDidMount() {
    // AppState.addEventListener('change', this._handleAppStateChange);
    this.subscription = Notifications.addListener(this.handleNotification);
    // guardo la respuesta en local
    this.getStatus();
  }

  // registro para notificaciones
  
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

    ///registro en mi base de datos por api
      data = JSON.stringify({
        token: this.state.token,clave:this.state.clave
    })
    console.log(data);
    // prepraro el envio
    // const myRequest = new Request('http://192.168.43.137/facena/api/registerapp',
    const myRequest = new Request('http://192.168.0.16/facena/api/registerapp',
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

  // PROBAR AUTO ENVIO DE NOTIFICACION
  sendPushNotification(token = this.state.token, title = this.state.title, body = this.state.body) {
    return fetch('https://exp.host/--/api/v2/push/send', {
      body: JSON.stringify({
        to: token,
        title: title,
        body: body,
        data: { message: `${title} - ${body}` },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }



  // RECIBO NOTIFICACION y guardo el objeto
  handleNotification = notification => {
    console.log("Handle Notificatio!!!!n")
    console.log(notification)

    this.setState({
      notification,
    });
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

  _borrar = async () => {
    try {
      AsyncStorage.removeItem('status');
      this.setState({bind:false})
    } catch (error) {
      console.log(error)
    }
  }
  render() {
    return (

      <View style={styles.container}>
      {/* <Text>updated 19</Text> */}
        {/* <TouchableOpacity
          onPress={() => this._borrar()}
          style={styles.touchable}>
          <Text>Borrar</Text>
        </TouchableOpacity> */}
      <Text style={styles.title}>Alerta FACENA</Text>
      {this.state.bind?
        (
              this.state.notification ? (
                <View>
                  {/* <Text style={styles.text}>Last Notification:</Text> */}
                <Text style={styles.text}>Expediente: {this.state.notification.data.expediente.numero}</Text>
                <Text style={styles.text}>Asunto: {this.state.notification.data.asunto}</Text>
                <Text style={styles.text}>Detalle: {this.state.notification.data.expediente.detalle_asunto}</Text>
                <Text style={styles.text}>Fecha: {this.state.notification.data.expediente.fecha}</Text>
                </View>
              ) : null
        ):
        (
        <View>
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
    fontSize: 18,
    padding: 8,
  },
  text: {
    paddingBottom: 2,
    padding: 8,
  },
  container: {
    flex: 1,
    paddingTop: 40,
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
});