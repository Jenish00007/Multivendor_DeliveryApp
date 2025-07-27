// useLogin.js
import { useState, useContext } from 'react'
import { Alert, Platform } from 'react-native'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import * as Notifications from 'expo-notifications'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'

export const useLogin = () => {
  const navigation = useNavigation()
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [inputError, setInputError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { setTokenAsync } = useContext(AuthContext)
  const { t } = useTranslation()

  const isEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  function validateCredentials() {
    let result = true
    setInputError(null)
    setPasswordError(null)

    if (!input) {
      setInputError('Please enter email')
      result = false
    } else if (!isEmail(input)) {
      setInputError('Please enter a valid email')
      result = false
    }

    if (!password) {
      setPasswordError('Please enter password')
      result = false
    }

    return result
  }

  // Helper: Get Expo push token
  const getExpoPushToken = async () => {
    let token = null;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Failed to get push token for push notification!');
        return null;
      }
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      console.log('expoPushToken', token);
    } else {
      Alert.alert('Physical device required', 'Must use physical device for Push Notifications');
    }
    // Android: set notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  };

  // Helper: Send push token to backend
  const sendPushTokenToBackend = async (expoPushToken, accessToken) => {
    try {
      const response = await fetch(`${API_URL}/deliveryman/expo-push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: expoPushToken }),
      });
      console.log('Push token update response status:', response.status);
      const text = await response.text();
      console.log('Push token update response text:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', e, text);
        data = null;
      }
      if (!response.ok) {
        console.warn('Failed to update push token:', data && data.message ? data.message : text);
      } else {
        console.log('Push token updated on backend:', data);
      }
    } catch (err) {
      console.error('Failed to send push token to backend:', err);
    }
  };

  async function loginAction() {
    if (!validateCredentials()) return

    setLoading(true)
    try {
      console.log('Attempting delivery man login with:', { email: input });
      
      const response = await fetch(`${API_URL}/deliveryman/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: input,
          password: password
        })
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Unable to connect to server. Please check your internet connection.');
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const data = await response.json().catch(error => {
        console.error('JSON parse error:', error);
        throw new Error('Invalid response from server');
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', data);
      
      if (!response.ok) {
        let errorMessage = data.message || 'Login failed';
        
        // Provide more specific error messages
        if (response.status === 400) {
          if (data.message?.includes("doesn't exists")) {
            errorMessage = 'No delivery man account found with this email. Please check your email or register a new account.';
          } else if (data.message?.includes("correct information")) {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          }
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (response.status === 404) {
          errorMessage = 'Delivery man account not found. Please check your email or contact support.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.token) {
        console.log("Login successful, storing token...");
        
        // Store delivery man specific data
        await AsyncStorage.setItem('userType', 'deliveryman');
        
        // Make sure we have valid deliveryman data before storing
        if (data.deliveryMan) {
          await AsyncStorage.setItem('deliverymanData', JSON.stringify(data.deliveryMan));
        } else if (data.user) {
          // Some APIs might return user instead of deliveryman
          await AsyncStorage.setItem('deliverymanData', JSON.stringify(data.user));
        } else {
          console.warn('No deliveryman data received from server');
        }
        
        // Store token without Bearer prefix
        const token = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
        console.log("Storing token:", token.substring(0, 10) + "...");
        
        // Check if delivery man is approved
        const deliverymanData = data.deliveryMan || data.user;
        if (deliverymanData && !deliverymanData.isApproved) {
          FlashMessage({
            message: 'Your account is pending approval. Please wait for admin approval.'
          });
          return;
        }

        // Get Expo push token and send to backend
        const expoPushToken = await getExpoPushToken();
        if (expoPushToken && data.token) {
          await sendPushTokenToBackend(expoPushToken, data.token);
        }

        // Set token - this will automatically trigger navigation to main app
        await setTokenAsync(token);
        
        FlashMessage({
          message: 'Login successful!',
          type: 'success'
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      FlashMessage({
        message: error.message || 'An error occurred during login. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      await AsyncStorage.removeItem('userType')
      await AsyncStorage.removeItem('deliverymanData')
      setTokenAsync(null)
      // Navigation will be handled automatically by the auth flow
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return {
    input,
    setInput,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    inputError,
    passwordError,
    loading,
    loginAction,
    currentTheme,
    themeContext
  }
}