import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useAppBranding } from '../../utils/translationHelper';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const LocationPermission = ({ onLocationGranted, onLocationDenied }) => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const branding = useAppBranding();

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      setIsLoading(true);
      
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        // Permission granted, get current location
        await getCurrentLocation();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 1000,
      });

      if (location && location.coords) {
        setLocation(location.coords);
        setIsLoading(false);
        
        // Call success callback with location
        if (onLocationGranted) {
          onLocationGranted(location.coords);
        }
      } else {
        // If location is not available, keep showing permission screen
        setIsLoading(false);
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setIsLoading(false);
      
      // Don't show error alert, just keep showing permission screen
      setPermissionStatus('denied');
    }
  };

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        // Permission granted, get location
        await getCurrentLocation();
      } else {
        setIsLoading(false);
        // Permission denied, keep showing permission screen
        // Don't show alert, just keep the permission screen visible
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsLoading(false);
      // Keep showing permission screen on error
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const renderPermissionRequest = () => (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: branding.backgroundColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: branding.primaryColor }]}>
          <MaterialIcon name="location-on" size={64} color="white" />
        </View>
        
        <Text style={[styles.title, { color: branding.textColor }]}>
          Location Access Required
        </Text>
        
        <Text style={[styles.description, { color: branding.textColor }]}>
          This delivery app needs access to your location to:
          {'\n'}• Show nearby orders
          {'\n'}• Calculate delivery distances
          {'\n'}• Provide accurate navigation
          {'\n'}• Track delivery progress
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: branding.primaryColor }]}
          onPress={requestLocationPermission}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={[styles.buttonText, { color: branding.whiteColorText }]}>
              Allow Location Access
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsButton, { borderColor: branding.primaryColor }]}
          onPress={openAppSettings}
        >
          <Text style={[styles.settingsButtonText, { color: branding.primaryColor }]}>
            Open Settings
          </Text>
        </TouchableOpacity>

        <Text style={[styles.noteText, { color: branding.textColor }]}>
          Location access is required to use this delivery app
        </Text>
      </View>
    </View>
  );

  const renderLocationLoading = () => (
    <View style={styles.container}>
      <View style={[styles.content, { backgroundColor: branding.backgroundColor }]}>
        <ActivityIndicator size="large" color={branding.primaryColor} />
        <Text style={[styles.loadingText, { color: branding.textColor }]}>
          Getting your location...
        </Text>
      </View>
    </View>
  );

  if (isLoading && permissionStatus === 'granted') {
    return renderLocationLoading();
  }

  if (permissionStatus !== 'granted') {
    return renderPermissionRequest();
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 350,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 150,
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default LocationPermission;
