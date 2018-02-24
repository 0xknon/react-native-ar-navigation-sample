import React, { PureComponent } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { DrawerItems, SafeAreaView } from 'react-navigation';

import { THEME_COLOR } from '../../config'
const { width, height } = Dimensions.get('window')

class Drawer extends PureComponent {
  render() {
    return (
        <ScrollView style={styles.container}>
            <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
                <DrawerItems {...this.props} />
            </SafeAreaView>
        </ScrollView>
    );
  }
}
export default Drawer


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: THEME_COLOR
    },
  });
  