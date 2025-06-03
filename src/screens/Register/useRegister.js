import { useState, useContext } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { emailRegex, passRegex, nameRegex } from '../../utils/regex'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../../config/api'

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/024/183/535/original/male-avatar-portrait-of-a-young-man-with-glasses-illustration-of-male-character-in-modern-color-style-vector.jpg'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const useRegister = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const route = useRoute()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(route.params?.email || '')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)

  const [nameError, setNameError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const validateCredentials = () => {
    let result = true
    setEmailError(null)
    setPasswordError(null)
    setNameError(null)

    if (!email) {
      setEmailError(t('emailErr1'))
      result = false
    } else if (!emailRegex.test(email.trim())) {
      setEmailError(t('emailErr2'))
      result = false
    }

    if (!password) {
      setPasswordError(t('passErr1'))
      result = false
    } else if (passRegex.test(password) !== true) {
      setPasswordError(t('passErr2'))
      result = false
    }

    if (!name) {
      setNameError(t('nameErr1'))
      result = false
    } else if (!nameRegex.test(name)) {
      setNameError(t('nameErr2'))
      result = false
    }

    return result
  }

  const registerAction = async () => {
    if (validateCredentials()) {
      try {
        const config = { 
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          } 
        }

        const newForm = new FormData()
        newForm.append("file", {
          uri: DEFAULT_AVATAR,
          type: 'image/jpeg',
          name: 'profile.jpg'
        })
        newForm.append("name", name)
        newForm.append("email", email.toLowerCase().trim())
        newForm.append("password", password)

        const response = await api.post(
          '/user/create-user',
          newForm,
          config
        )

        if (response.data) {
          // Store the token if it's in the response
          if (response.data.token) {
            await AsyncStorage.setItem('token', response.data.token)
          }

          FlashMessage({
            message: response.data.message || t('registrationSuccess'),
          })
          // Reset form
          setName('')
          setEmail('')
          setPassword('')
          
          navigation.replace('Login', {
            email: email.toLowerCase().trim()
          })
        }
      } catch (error) {
        console.log('Registration error:', error.response?.data || error.message)
        FlashMessage({
          message: error.response?.data?.message || 
                 error.response?.data?.error || 
                 t('registrationFailed'),
        })
      }
    }
  }

  return {
    email,
    setEmail,
    emailError,
    name,
    setName,
    nameError,
    password,
    setPassword,
    passwordError,
    visible,
    setVisible,
    registerAction,
    themeContext,
    currentTheme
  }
}

export default useRegister
