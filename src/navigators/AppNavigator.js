import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addNavigationHelpers, StackNavigator, DrawerNavigator } from 'react-navigation';
import Home from '../screens/Home';
import Test from '../screens/Test';
import Drawer from '../screens/Drawer';

export const AppNavigator = DrawerNavigator(
  {
    Home: {
      screen: Home,
      path: 'home',
    }
  },
  {
    drawerOpenRoute: 'DrawerOpen',
    drawerCloseRoute: 'DrawerClose',
    drawerToggleRoute: 'DrawerToggle',
    initialRouteName: 'Home',
    contentOptions: {
      activeTintColor: '#fff',
      inactiveTintColor: '#fff'
    },
    contentComponent: Drawer
  }
);

const AppWithNavigationState = ({ dispatch, nav }) => (
  <AppNavigator />
);

AppWithNavigationState.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  priceData: state.priceData
});

export default connect(mapStateToProps)(AppWithNavigationState);
