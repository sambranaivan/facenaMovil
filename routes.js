import React from 'react';
import { createStackNavigator, createDrawerNavigator, createAppContainer } from 'react-navigation';


import Home from './views/home';
import Admin from './views/admin';
// import Notificaciones from './views/notificaciones';
// import Menu from './views/menu';
// import Sincro from './views/sincro';

const Stack = createStackNavigator(
    {
    Home: { screen: Home },
    }, 
    { 
        initialRouteName: 'Home', 
        headerMode: 'none' 
    });
// const navigator = createDrawerNavigator(
//     {
//         Home:{screen:Home},
//         // Admin: { screen: Admin }
//     }
//     ,
//     {

//     })


const App = createAppContainer(Stack);
export default App;