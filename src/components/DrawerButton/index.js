import React, { PropTypes, Component } from 'react';
import { View, Button, TouchableOpacity, Platform, ScrollView, StatusBar } from 'react-native';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class HeaderLeft extends Component {
    render() {
        let { navigation } = this.props;
        return (
            <TouchableOpacity style={{paddingLeft: 16}} onPress={() => {navigation.navigate('DrawerOpen')}}>
                <MaterialIcons 
                    name="dehaze" 
                    style={{ color: 'white' }} 
                    size={24} />
            </TouchableOpacity>
        );
    }
}

export default HeaderLeft