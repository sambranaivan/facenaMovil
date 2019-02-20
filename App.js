import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import { Permissions, Notifications } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      clave:null,
      notification: null,
      title: 'Hello World',
      body: 'Say something!',
    };
  }

  componentDidMount() {
    // AppState.addEventListener('change', this._handleAppStateChange);
    this.subscription = Notifications.addListener(this.handleNotification);
    // guardo la respuesta en local
  }

  // registro para notificaciones
  
  async registerForPushNotifications() {
    // PRIMERO PIDO PERMISO
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
    const myRequest = new Request('http://192.168.43.137/facena/api/registerapp',
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

  render() {
    return (

      <KeyboardAvoidingView style={styles.container} behavior="position">
        <Text style={styles.title}>Alerta Expedientes</Text>
        <Text style={styles.text}>Clave de Vinculación</Text>
        <TextInput
          style={styles.input}
          onChangeText={clave => this.setState({ clave })}
          maxLength={100}
          value={this.state.clave}
        />
        {/* <Text style={styles.text}>Message</Text>
        <TextInput
          style={styles.input}
          onChangeText={body => this.setState({ body })}
          maxLength={100}
          value={this.state.body}
        /> */}
        <TouchableOpacity
          onPress={() => this.registerForPushNotifications()}
          style={styles.touchable}>
          <Text>Registrar Aplicación</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => this.sendPushNotification()} style={styles.touchable}>
          <Text>Send me a notification!</Text>
        </TouchableOpacity> */}
        {this.state.token ? (
          <View>
            <Text style={styles.text}>Token</Text>
            <TextInput
              style={styles.input}
              onChangeText={token => this.setState({ token })}
              value={this.state.token}
            />
          </View>
        ) : null}
        {this.state.notification ? (
          <View>
            <Text style={styles.text}>Last Notification:</Text>
            <Text style={styles.text}>{JSON.stringify(this.state.notification.data.message)}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
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