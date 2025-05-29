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
const API_URL = 'https://api.qauds.in/api/v2'

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

      const response = await fetch(`${API_URL}/user/login-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: input,
          password: password
        })
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401 || data.message === 'Unauthenticated') {
          await logout()
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(data.message || 'Login failed')
      }

      if (data.token) {
        await setTokenAsync(data.token)
        navigation.navigate({
          name: 'Menu',
          merge: true
        })
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      FlashMessage({
        message: error.message || t('errorWhileLogging')
      })
    } finally {
      setLoading(false)
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