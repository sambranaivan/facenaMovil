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