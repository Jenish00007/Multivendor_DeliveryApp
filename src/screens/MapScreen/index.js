import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import styles from './styles'; // Assuming styles.js defines map styles

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Replace with your actual Google Maps Directions API Key
const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY'; 

const MapScreen = ({ route, navigation }) => {
  const mapRef = useRef(null);
  const { originLat, originLng, destinationLat, destinationLng, destinationName } = route.params;

  const origin = {
    latitude: originLat,
    longitude: originLng,
  };

  const destination = {
    latitude: destinationLat,
    longitude: destinationLng,
  };

  // Function to fit the map to the markers and directions
  const fitMapToMarkers = () => {
    if (mapRef.current) {
      mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  if (!originLat || !originLng || !destinationLat || !destinationLng) {
    Alert.alert("Map Error", "Origin or destination coordinates are missing.");
    navigation.goBack();
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: originLat,
          longitude: originLng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onMapReady={fitMapToMarkers}
      >
        <Marker
          coordinate={origin}
          title="Your Location"
          identifier="origin"
        />
        <Marker
          coordinate={destination}
          title={destinationName || "Destination"}
          identifier="destination"
        />

        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="hotpink"
          optimizeWaypoints={true}
          onReady={result => {
            console.log(`Distance: ${result.distance} km`);
            console.log(`Duration: ${result.duration} mins.`);
            fitMapToMarkers(); // Fit to directions after they are ready
          }}
          onError={(errorMessage) => {
            console.log('GOT AN ERROR', errorMessage);
            Alert.alert("Directions Error", errorMessage);
          }}
        />
      </MapView>
    </View>
  );
};

export default MapScreen; 