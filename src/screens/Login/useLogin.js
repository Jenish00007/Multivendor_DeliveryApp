import { useState, useContext } from 'react'
import { Alert } from 'react-native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import AuthContext from '../../context/Auth'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'
import messaging from '@react-native-firebase/messaging'

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

  // ✅ Helper: Get FCM token from Firebase
  const getFcmToken = async () => {
    try {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL

      if (!enabled) {
        Alert.alert(
          'Permission required',
          'Notification permission not granted!'
        )
        return null
      }

      const token = await messaging().getToken()
      console.log('FCM Token:', token)
      return token
    } catch (err) {
      console.error('Error getting FCM token:', err)
      return null
    }
  }

  // ✅ Helper: Send FCM token to backend
  const sendFcmTokenToBackend = async (fcmToken, accessToken) => {
    try {
      const response = await fetch(`${API_URL}/deliveryman/expo-push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token: fcmToken })
      })

      console.log('Push token update response status:', response.status)
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        console.warn(
          'Failed to update FCM token:',
          data?.message || 'Unknown error'
        )
      } else {
        console.log('✅ FCM token updated on backend:', data)
      }
    } catch (err) {
      console.error('Failed to send FCM token to backend:', err)
    }
  }

  // ✅ Login Action
  async function loginAction() {
    if (!validateCredentials()) return

    setLoading(true)
    try {
      console.log('Attempting delivery man login with:', { email: input })

      const response = await fetch(`${API_URL}/deliveryman/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          email: input,
          password: password
        })
      })

      if (!response) {
        throw new Error('No response from server')
      }

      const data = await response.json().catch(() => null)

      console.log('Login response status:', response.status)
      console.log('Login response data:', data)

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      if (data.token) {
        console.log('✅ Login successful, storing token...')

        await AsyncStorage.setItem('userType', 'deliveryman')
        if (data.deliveryMan) {
          await AsyncStorage.setItem(
            'deliverymanData',
            JSON.stringify(data.deliveryMan)
          )
        }

        const token = data.token.startsWith('Bearer ')
          ? data.token.substring(7)
          : data.token

        // Check if delivery man is approved
        const deliverymanData = data.deliveryMan
        if (deliverymanData && !deliverymanData.isApproved) {
          FlashMessage({
            message:
              'Your account is pending approval. Please wait for admin approval.'
          })
          return
        }

        // ✅ Get FCM token and send to backend
        const fcmToken = await getFcmToken()
        if (fcmToken && data.token) {
          await sendFcmTokenToBackend(fcmToken, data.token)
        }

        // Set token -> navigate to app
        await setTokenAsync(token)

        FlashMessage({
          message: 'Login successful!',
          type: 'success'
        })
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Login error:', error)
      FlashMessage({
        message:
          error.message || 'An error occurred during login. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      await AsyncStorage.removeItem('userType')
      await AsyncStorage.removeItem('deliverymanData')
      setTokenAsync(null)
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
