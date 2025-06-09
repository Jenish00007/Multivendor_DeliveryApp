// useLogin.js
import { useState, useContext } from 'react'
import { Alert } from 'react-native'
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

  async function loginAction() {
    if (!validateCredentials()) return

    setLoading(true)
    try {
      let notificationToken = null
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        if (existingStatus === 'granted') {
          notificationToken = (
            await Notifications.getExpoPushTokenAsync({
              projectId: Constants.expoConfig.extra.eas.projectId
            })
          ).data
        }
      }

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
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw new Error(data.message || 'Login failed');
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
        await AsyncStorage.setItem('token', token);
        await setTokenAsync(token);
        
        // Check if delivery man is approved
        const deliverymanData = data.deliveryMan || data.user;
        if (deliverymanData && !deliverymanData.isApproved) {
          FlashMessage({
            message: 'Your account is pending approval. Please wait for admin approval.'
          });
          return;
        }

        navigation.navigate({
          name: 'DeliveryHome',
          merge: true
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
      setTokenAsync(null)
      navigation.navigate('Login')
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