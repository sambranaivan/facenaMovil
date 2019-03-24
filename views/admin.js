import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, AsyncStorage } from 'react-native';
import { Constants } from "expo";
import { Button } from 'react-native-elements';

export default class Admin extends Component {

    static navigationOptions = {
        title: "Administración"
    }
    constructor(props) {
        super(props);
        this.state = {
        };
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
                <Text> Administración </Text>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={() => this._borrar()}>
                    <Text>Borrar</Text>
                </TouchableOpacity>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    padre: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ffffff'

    },
    touchable: {
        borderWidth: 1,
        borderRadius: 4,
        margin: 8,
        padding: 8,
        width: '95%',
    },
});
