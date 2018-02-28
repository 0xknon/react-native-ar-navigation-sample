
const React = require('react-native');
import { StyleSheet, Dimensions, Image } from 'react-native';

const { width, height } = Dimensions.get('window');
const boxWidth = 120

module.exports = StyleSheet.create({
    distanceBox: { 
        position: 'absolute', 
        bottom: 80, 
        left: (width - boxWidth) / 2, 
        width: boxWidth, 
        height: 50, 
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
