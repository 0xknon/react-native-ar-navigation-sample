import Expo, { Asset } from 'expo';
import React from 'react';
import { View, PanResponder } from 'react-native';

const THREE = require('three');
global.THREE = THREE;
require('../../../OBJLoader');
require('../../../Water');
import ExpoTHREE from 'expo-three';
import * as CANNON from 'cannon';

import BlueOverlay from '../../components/BlueOverlay'

const WATER_Y = -0.15;

console.disableYellowBox = true;

const scaleLongestSideToSize = (mesh, size) => {
  const { x: width, y: height, z: depth } =
    new THREE.Box3().setFromObject(mesh).size();
  const longest = Math.max(width, Math.max(height, depth));
  const scale = size / longest;
  mesh.scale.set(scale, scale, scale);
}

export default class App extends React.Component {
  state = {
    loaded: false,
  }

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.touching = true;
      },
      onPanResponderRelease: () => {
        this.touching = false;
      },
      onPanResponderTerminate: () => {
        this.touching = false;
      },
      onShouldBlockNativeResponder: () => false,
    });
    this.preloadAssetsAsync();
  }

  render() {
    return this.state.loaded ? (
      <View style={{ flex: 1 }}>
        <Expo.GLView
          {...this.panResponder.panHandlers}
          ref={(ref) => this._glView = ref}
          style={{ flex: 1 }}
          onContextCreate={this._onGLContextCreate}
        />
        <BlueOverlay ref={(ref) => this.overlay = ref} />
      </View>
    ) : <Expo.AppLoading />;
  }

  async preloadAssetsAsync() {
    await Promise.all([
      require('../../../assets/arrow.obj'),
    ].map((module) => Expo.Asset.fromModule(module).downloadAsync()));
    this.setState({ loaded: true });
  }

  _onGLContextCreate = async (gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    gl.createRenderbuffer = () => {};
    gl.bindRenderbuffer = () => {};
    gl.renderbufferStorage  = () => {};
    gl.framebufferRenderbuffer  = () => {};

    // ar init
    const arSession = await this._glView.startARSessionAsync();

    // three.js init
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(width, height);
    
    const scene = new THREE.Scene();
    const videoFeed = ExpoTHREE.createARBackgroundTexture(arSession, renderer);
    scene.background = videoFeed;
    const camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);
    // const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 1000);


    // lights
    const dirLight = new THREE.DirectionalLight(0xdddddd);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);
    const ambLight = new THREE.AmbientLight(0x505050);
    scene.add(ambLight);


    // objects (three.js mesh <-> cannon.js body pairs)
    const objects = [];

    // model
    const modelAsset = Asset.fromModule(require('../../../assets/arrow.obj'));
    await modelAsset.downloadAsync();
    const loader = new THREE.OBJLoader();
    const model = loader.parse(
      await Expo.FileSystem.readAsStringAsync(modelAsset.localUri))

    scaleLongestSideToSize(model, 0.18);

    //scene.add(model);
    camera.add(model)
    model.position.set(100,100,100);
    //model.add(camera)

    // main loop
    let lastAbove = true;
    const buoyancy = 20;
    const animate = () => {
        //calculate camera position
        camera.position.setFromMatrixPosition(camera.matrixWorld);
        const cameraPos = new THREE.Vector3(0, 0, 0);
        cameraPos.applyMatrix4(camera.matrixWorld);

        // apply force toward camera if touching
        objects.forEach(({ body }) => {
            if (this.touching) {
                const d = body.position.vsub(cameraPos).unit().scale(-1.2);
                body.applyForce(d, body.position);
            }
        });

        // end frame and schedule new one!
        renderer.render(scene, camera);
        gl.endFrameEXP();
        requestAnimationFrame(animate);
    }
    animate();
  }
}
