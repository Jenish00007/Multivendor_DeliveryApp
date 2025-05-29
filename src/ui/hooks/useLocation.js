import * as Location from 'expo-location'
import { getLocationFromStorage } from './useWatchLocation'

export const getCurrentLocation = async () => {
  const { status, canAskAgain } = await Location.getForegroundPermissionsAsync()
  
  if (status === 'granted') {
    try {
      const location = await Location.getCurrentPositionAsync({
        enableHighAccuracy: true
      })
      return { ...location, error: false }
    } catch (e) {
      return { error: true, message: e.message }
    }
  } else if (canAskAgain) {
    const { status: newStatus } = await Location.requestForegroundPermissionsAsync()
    if (newStatus === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true
        })
        return { ...location, error: false }
      } catch (e) {
        return { error: true, message: e.message }
      }
    }
  }
  return { error: true, message: 'Location permission is required to use this app' }
}

export default function useLocation() {
  const getLocationPermission = async () => {
    const {
      status,
      canAskAgain
    } = await Location.getForegroundPermissionsAsync()
    return { status, canAskAgain }
  }

  const askLocationPermission = async () => {
    let finalStatus = null
    let finalCanAskAgain = null
    const {
      status: currentStatus,
      canAskAgain: currentCanAskAgain
    } = await Location.getForegroundPermissionsAsync()
    finalStatus = currentStatus === 'granted' ? 'granted' : 'denied'
    finalCanAskAgain = currentCanAskAgain
    if (currentStatus === 'granted') {
      return { status: finalStatus, canAskAgain: finalCanAskAgain }
    }
    if (currentCanAskAgain) {
      const {
        status,
        canAskAgain
      } = await Location.requestForegroundPermissionsAsync()
      finalStatus = status === 'granted' ? 'granted' : 'denied'
      finalCanAskAgain = canAskAgain
      if (status === 'granted') {
        return { status: finalStatus, canAskAgain: finalCanAskAgain }
      }
    }
    return { status: finalStatus, canAskAgain: finalCanAskAgain }
  }

  return { getCurrentLocation, getLocationPermission }
}
