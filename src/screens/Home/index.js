import Expo, { Asset } from 'expo';
import React from 'react';
import { View, Dimensions } from 'react-native';
import { StackNavigator } from 'react-navigation'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

require('../../../OBJLoader');

import * as THREE from 'three'; // 0.87.1
import ExpoTHREE from 'expo-three'; // 2.0.2

import DrawerButton from '../../components/DrawerButton'

import { THEME_COLOR } from '../../config'
const { width, height } = Dimensions.get("window")

console.disableYellowBox = true;

const scaleLongestSideToSize = (mesh, size) => {
    const { x: width, y: height, z: depth } =
      new THREE.Box3().setFromObject(mesh).size();
    const longest = Math.max(width, Math.max(height, depth));
    const scale = size / longest;
    mesh.scale.set(scale, scale, scale);
}


class Home extends React.Component {
    state = {
        loaded: false,
    }

    static navigationOptions = ({ navigation }) => ({
        title: '',
        headerLeft: <DrawerButton navigation={navigation}/>,
        headerStyle: {
            position: 'absolute', backgroundColor: 'transparent', 
            zIndex: 100, top: 0, left: 0, right: 0,
            borderBottomWidth: 0,
        },
        drawerLabel: 'Home',
        drawerIcon: ({ tintColor }) => (
          <MaterialIcons
            name="home"
            size={24}
            style={{ color: tintColor }}
          />
        ),
    });

    async preloadAssetsAsync() {
        await Promise.all([
            require('../../../assets/arrow.obj'),
        ].map((module) => Expo.Asset.fromModule(module).downloadAsync()));
        this.setState({ loaded: true });
    }

    componentWillMount() {
        this.preloadAssetsAsync()
    }

    render() {
        return (
            <View style={{flex: 1}} >
                <Expo.GLView
                    ref={(ref) => this._glView = ref}
                    style={{ flex: 1 }}
                    onContextCreate={this._onGLContextCreate}
                />
                <Expo.GLView
                    style={{ position: 'absolute', width, height }}
                    onContextCreate={this.arrowContextCreate}
                />
            </View>
        );
    }

    arrowContextCreate = async (gl) => {
        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;
    
        gl.createRenderbuffer = () => {};
        gl.bindRenderbuffer = () => {};
        gl.renderbufferStorage  = () => {};
        gl.framebufferRenderbuffer  = () => {};

        const renderer = ExpoTHREE.createRenderer({ gl });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          75,
          gl.drawingBufferWidth / gl.drawingBufferHeight,
          0.1,
          1000
        );

        // lights
        const dirLight = new THREE.DirectionalLight(0xdddddd);
        dirLight.position.set(1, 1, 1);
        scene.add(dirLight);
        const ambLight = new THREE.AmbientLight(0x505050);
        scene.add(ambLight);


        //model
        const modelAsset = Asset.fromModule(require('../../../assets/arrow.obj'));
        await modelAsset.downloadAsync();
        const loader = new THREE.OBJLoader();
        const model = loader.parse(
            await Expo.FileSystem.readAsStringAsync(modelAsset.localUri))
        model.position.z = -0.4;
        model.position.y = -0.1;
        model.rotation.x += -1.2;
        //model.rotation.y += 1.57;
        model.rotation.z += 1.57;
        scaleLongestSideToSize(model, 0.15);

        scene.add(model);

        const render = () => {
            requestAnimationFrame(render);
      
            renderer.render(scene, camera);
      
            // NOTE: At the end of each frame, notify `Expo.GLView` with the below
            gl.endFrameEXP();
        };
        render();
    }

  _onGLContextCreate = async (gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    const arSession = await this._glView.startARSessionAsync();

    const scene = new THREE.Scene();
    const camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);

    const animate = () => {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();

  }
}

const HomeStack = StackNavigator(
    {
        HomeScreen: {
            screen: Home,
        }
    }
);

export default HomeStack