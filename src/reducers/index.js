import { combineReducers } from 'redux';
import { NavigationActions } from 'react-navigation';

import { AppNavigator } from '../navigators/AppNavigator';
import appState from './appState'

// Start with two routes: The Main screen, with the Login screen on top.
const AppReducer = combineReducers({
//   nav,
//   platformPrice,
//   platformFee,
    appState
});

export default AppReducer;
