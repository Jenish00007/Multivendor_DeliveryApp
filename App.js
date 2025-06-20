import React, { useState, useEffect, useReducer, useRef } from 'react'
import AppContainer from './src/routes'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import * as Font from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { getCurrentLocation } from './src/ui/hooks/useLocation'
import { LocationContext } from './src/context/Location'
import AnimatedSplash from './src/components/AnimatedSplash'

import {
  BackHandler,
  Platform,
  StatusBar,
  LogBox,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
  View,
  Text
} from 'react-native'
import { ApolloProvider } from '@apollo/client'
import { exitAlert } from './src/utils/androidBackButton'
import FlashMessage from 'react-native-flash-message'
import setupApolloClient from './src/apollo/index'
import ThemeReducer from './src/ui/ThemeReducer/ThemeReducer'
import ThemeContext from './src/ui/ThemeContext/ThemeContext'
import { ConfigurationProvider } from './src/context/Configuration'
import { UserProvider } from './src/context/User'
import { AuthProvider } from './src/context/Auth'
import { theme as Theme } from './src/utils/themeColors'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'expo-dev-client'
import useEnvVars, { isProduction } from './environment'
import { requestTrackingPermissions } from './src/utils/useAppTrackingTrasparency'
import { OrdersProvider } from './src/context/Orders'
import { MessageComponent } from './src/components/FlashMessage/MessageComponent'
import * as Updates from 'expo-updates'
import ReviewModal from './src/components/Review'
import { NOTIFICATION_TYPES } from './src/utils/enums'
import { useColorScheme } from 'react-native'
import useWatchLocation from './src/ui/hooks/useWatchLocation'

LogBox.ignoreLogs([
  'Warning: ...',
  'Sentry Logger ',
  'Constants.deviceYearClass'
]) // Ignore log notification by message
LogBox.ignoreAllLogs() // Ignore all log notifications


Notifications.setNotificationHandler({
  handleNotification: async notification => {
    return {
      shouldShowAlert: notification?.request?.content?.data?.type !== NOTIFICATION_TYPES.REVIEW_ORDER,
      shouldPlaySound: false,
      shouldSetBadge: false
    }
  }
})

export default function App() {
  const reviewModalRef = useRef()
  const [appIsReady, setAppIsReady] = useState(false)
  const [location, setLocation] = useState(null)
  const notificationListener = useRef()
  const responseListener = useRef()
  const [orderId, setOrderId] = useState()
  const systemTheme = useColorScheme()
  const [theme, themeSetter] = useReducer(ThemeReducer, systemTheme === 'dark' ? 'Dark' : 'Pink')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isInitializingLocation, setIsInitializingLocation] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  useWatchLocation()
  useEffect(() => {
    const loadAppData = async () => {
      try {
        await SplashScreen.preventAutoHideAsync()
        await Font.loadAsync({
          MuseoSans300: require('./src/assets/font/MuseoSans/MuseoSans300.ttf'),
          MuseoSans500: require('./src/assets/font/MuseoSans/MuseoSans500.ttf'),
          MuseoSans700: require('./src/assets/font/MuseoSans/MuseoSans700.ttf')
        })

        // Initialize location
        const { coords, error } = await getCurrentLocation()
        if (!error && coords) {
          const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          const response = await fetch(apiUrl)
          const data = await response.json()
          
          if (!data.error) {
            let address = data.display_name
            if (address.length > 21) {
              address = address.substring(0, 21) + '...'
            }
            
            setLocation({
              label: 'currentLocation',
              latitude: coords.latitude,
              longitude: coords.longitude,
              deliveryAddress: address
            })
          }
        } else {
          // Set default location in India (Delhi)
          setLocation({
            label: 'defaultLocation',
            latitude: 28.6139,
            longitude: 77.2090,
            deliveryAddress: 'Delhi, India'
          })
        }

        BackHandler.addEventListener('hardwareBackPress', exitAlert)
        setAppIsReady(true)
      } catch (e) {
        console.warn(e)
        // Set default location in India (Delhi) if there's an error
        setLocation({
          label: 'defaultLocation',
          latitude: 28.6139,
          longitude: 77.2090,
          deliveryAddress: 'Delhi, India'
        })
        setAppIsReady(true)
      }
    }

    loadAppData()

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', exitAlert)
    }
  }, [])

  useEffect(() => {
    try {
      themeSetter({ type: systemTheme === 'dark' ? 'Dark' : 'Pink' })
    } catch (error) {
      // Error retrieving data
      console.log('Theme Error : ', error.message)
    }
  }, [systemTheme])

  useEffect(() => {
    if (!appIsReady) return

    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync()
    }

    hideSplashScreen()
  }, [appIsReady])

  useEffect(() => {
    if (!location) return

    const saveLocation = async () => {
      await AsyncStorage.setItem('location', JSON.stringify(location))
    }

    saveLocation()
  }, [location]) 

  useEffect(() => { 
    requestTrackingPermissions()
  }, [])


  const client = setupApolloClient()
  const shouldBeRTL = false;
  if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    Updates.reloadAsync();
  }
 
  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (__DEV__) return
      ; (async () => {
        const { isAvailable } = await Updates.checkForUpdateAsync()
        if (isAvailable) {
          try {
            setIsUpdating(true)
            const { isNew } = await Updates.fetchUpdateAsync()
            if (isNew) {
              await Updates.reloadAsync()
            }
          } catch (error) {
            console.log('error while updating app', JSON.stringify(error))
          } finally {
            setIsUpdating(false)
          }
        }
      })()
  }, [])

  if (isUpdating) {
    return (
      <View
        style={[
          styles.flex,
          styles.mainContainer,
          { backgroundColor: Theme[theme].startColor }
        ]}
      >
        <TextDefault textColor={Theme[theme].white} bold>
          Please wait while app is updating
        </TextDefault>
        <ActivityIndicator size='large' color={Theme[theme].white} />
      </View>
    )
  }

  useEffect(() => {
    registerForPushNotificationsAsync()

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      if (notification?.request?.content?.data?.type === NOTIFICATION_TYPES.REVIEW_ORDER) {
        const id = notification?.request?.content?.data?._id
        if (id) {
          setOrderId(id)
          reviewModalRef?.current?.open()
        }
      }
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (response?.notification?.request?.content?.data?.type === NOTIFICATION_TYPES.REVIEW_ORDER) {
        const id = response?.notification?.request?.content?.data?._id
        if (id) {
          setOrderId(id)
          reviewModalRef?.current?.open()
        }
      }
    })
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current)
      Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [])

  const onOverlayPress = () => {
    reviewModalRef?.current?.close()
  }

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  if (!appIsReady || showSplash) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplash onAnimationComplete={handleSplashComplete} />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApolloProvider client={client}>
        <ThemeContext.Provider
          value={{ ThemeValue: theme, dispatch: themeSetter }}>
          <StatusBar
            backgroundColor={Theme[theme].newheaderColor}
            barStyle={theme === 'Dark' ? 'light-content' : 'dark-content'}
          />
          <LocationContext.Provider value={{ location, setLocation }}>
            <ConfigurationProvider>
              <AuthProvider>
                <UserProvider>
                  <OrdersProvider>
                    <AppContainer />
                    <ReviewModal ref={reviewModalRef} onOverlayPress={onOverlayPress} theme={Theme[theme]} orderId={orderId} />
                  </OrdersProvider>
                </UserProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </LocationContext.Provider>
          <FlashMessage MessageComponent={MessageComponent} />
        </ThemeContext.Provider>
      </ApolloProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
})
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
    }
  } else {
    alert('Must use physical device for Push Notifications')
  }
}