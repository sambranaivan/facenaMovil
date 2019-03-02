import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';


import Home from './views/home';
// import Notificaciones from './views/notificaciones';
// import Menu from './views/menu';
// import Sincro from './views/sincro';

const Stack = createStackNavigator({
    Home: { screen: Home },
    // Notificaciones: { screen: Notificaciones },
    // Menu: { screen: Menu },s
    // Sincro: { screen: Sincro }
}, { initialRouteName: 'Home', headerMode: 'none' });

const App = createAppContainer(Stack);
export default App;