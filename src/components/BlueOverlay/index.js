
import React from 'react';
import { View, PanResponder } from 'react-native';

export default class BlueOverlay extends React.Component {
    state = {
      visible: false,
    }
  
    render() {
      return this.state.visible ? (
        <View
          style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0, right: 0,
            backgroundColor: '#001e0fa0',
          }}
        />
      ) : null;
    }
  
    setVisible(visible) {
      this.setState({ visible });
    }
  }
  