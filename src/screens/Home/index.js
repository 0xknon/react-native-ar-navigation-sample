import Expo, { Asset, Location, Permissions, Constants } from 'expo';
import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { StackNavigator } from 'react-navigation'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

require('../../../OBJLoader');

import * as THREE from 'three'; // 0.87.1
import ExpoTHREE from 'expo-three'; // 2.0.2

import DrawerButton from '../../components/DrawerButton'

import { THEME_COLOR } from '../../config'
import styles from './styles'
const { width, height } = Dimensions.get("window")

console.disableYellowBox = true;

const scaleLongestSideToSize = (mesh, size) => {
    const { x: width, y: height, z: depth } =
      new THREE.Box3().setFromObject(mesh).size();
    const longest = Math.max(width, Math.max(height, depth));
    const scale = size / longest;
    mesh.scale.set(scale, scale, scale);
}

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};
   
// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};
const getDistanceFromPoints = (lat1,lon1,lat2,lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = Math.radians(lat2-lat1);  // deg2rad below
    var dLon = Math.radians(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(Math.radians(lat1)) * Math.cos(Math.radians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

const calAngleFromNorth = (myLat, myLong, targetLat, targetLong) => {
    let latDistance = targetLat - myLat;
    let longDistance = targetLong - myLong;

    let angle = 0;
    let absoluteAngle = Math.atan(Math.abs(latDistance) / Math.abs(longDistance))
    if (latDistance >= 0 && longDistance >= 0) {
        angle = (90 * Math.PI / 180) - absoluteAngle;
    } else if (latDistance >= 0 && longDistance < 0) {
        angle = (270 * Math.PI / 180) + absoluteAngle;
    } else if (latDistance < 0 && longDistance < 0) {
        angle = (270 * Math.PI / 180) - absoluteAngle;
    } else if (latDistance < 0 && longDistance >= 0) {
        angle = (90 * Math.PI / 180) + absoluteAngle;
    }
    return Math.degrees(angle);
}


class Home extends React.Component {
    arrow = null;

    state = {
        loaded: false,
        searchText: '',
        latitude: 0,
        longitude: 0,
        targetLatitude: 0,
        targetLongitude: 0,
        isLocationSelected: false,
        magHeading: 0,
        angleFromNorth: 0,
        arrowAngle: 0,
        distance: 0
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
        this.preloadAssetsAsync();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({ 
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
              this._disableRowLoaders();
              alert(error.message);
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 1000
            }
        );

        this.watchID = navigator.geolocation.watchPosition((position) => {
            let { targetLatitude, targetLongitude, isLocationSelected } = this.state;
            let { latitude, longitude } = position.coords
            let distance = 0;

            if (this.arrow != null && isLocationSelected)
                distance = getDistanceFromPoints(latitude, longitude, targetLatitude, targetLongitude)

            this.setState({ 
                latitude,
                longitude,
                distance
            });


        });

        Expo.Location.watchHeadingAsync((compass) => {
            let { latitude, longitude, targetLatitude, targetLongitude, isLocationSelected } = this.state;
            let angleFromNorth = calAngleFromNorth(latitude, longitude, targetLatitude, targetLongitude)
            this.setState({ 
                magHeading: compass.magHeading
            });

            if (this.arrow != null && isLocationSelected)
                this.arrow.rotation.z = 1.57 + Math.radians(-1 * (angleFromNorth - compass.magHeading));
        })
    }

    componentDidMount() {

    }

    renderGoogleSearch() {
        let { searchText, latitude, longitude } = this.state;
        return(

            <View style={{left: 10, top: 64, position: 'absolute', width: width - 20, backgroundColor: 'white'}}>
                <GooglePlacesAutocomplete
                    placeholder='Search'
                    minLength={2} // minimum length of text to search
                    autoFocus={false}
                    returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                    listViewDisplayed='auto'    // true/false/undefined
                    fetchDetails={true}
                    renderDescription={row => row.description} // custom description render
                    onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                        let { latitude, longitude, targetLatitude, targetLongitude, isLocationSelected, magHeading } = this.state;
                        let distance = getDistanceFromPoints(latitude, longitude, details.geometry.location.lat, details.geometry.location.lng)
                        this.setState({
                            isLocationSelected: (data.description != '')? true : false,
                            searchText: data.description,
                            targetLatitude: details.geometry.location.lat,
                            targetLongitude: details.geometry.location.lng,
                            distance
                        })

                        let angleFromNorth = calAngleFromNorth(latitude, longitude, details.geometry.location.lat, details.geometry.location.lng )
                        this.arrow.rotation.z = 1.57 + Math.radians(-1 * (angleFromNorth - magHeading));
                        

                    }}
                    textInputProps={{
                        value: searchText,
                        onChangeText: (searchText) => this.setState({searchText})
                    }} 
                    getDefaultValue={() => ''}
                    
                    query={{
                        // available options: https://developers.google.com/places/web-service/autocomplete
                        key: 'AIzaSyC3AQ_gcSsvb_8dcxgBHEUK6YdXEzR2yOQ',
                        language: 'en', // language of the results
                        types: 'geocode', // default: 'geocode'
                        radius: 10000,
                        location: latitude+','+longitude
                    }}
                    
                    styles={{
                        textInputContainer: {
                            width: '100%'
                        },
                        description: {
                            fontWeight: 'bold'
                        },
                        predefinedPlacesDescription: {
                            color: '#1faadb'
                        }
                    }}
                    
                    nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                    GoogleReverseGeocodingQuery={{
                        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                    }}
                    GooglePlacesSearchQuery={{
                        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                        rankby: 'distance',
                        types: 'food'
                    }}

                    filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} 
                    debounce={200} 
                    
                    />
            </View>
        );
    }

    renderDistanceBox() {
        return (
            <View style={styles.distanceBox} >
                <Text>{this.state.distance.toFixed(3)} km</Text>
            </View>
        );
    }

    render() {
        let { latitude, longitude } = this.state
        return (
            <View style={{flex: 1}} >
                <Expo.GLView
                    ref={(ref) => this._glView = ref}
                    style={{ flex: 1 }}
                    onContextCreate={this._onGLContextCreate} />
                <Expo.GLView
                    style={{ position: 'absolute', width, height }}
                    onContextCreate={this.arrowContextCreate} />

                { this.renderGoogleSearch() }
                { this.renderDistanceBox() }
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

        this.arrow = loader.parse(
            await Expo.FileSystem.readAsStringAsync(modelAsset.localUri))
        this.arrow.position.z = -0.4;
        this.arrow.position.y = -0.1;

        this.arrow.rotation.x = -1.2;
        this.arrow.rotation.z = 1.57;
        
        scaleLongestSideToSize(this.arrow, 0.15);

        scene.add(this.arrow);
        
        const render = () => {
            requestAnimationFrame(render);

            renderer.render(scene, camera);
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