import { useState, useContext } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { emailRegex, passRegex, nameRegex } from '../../utils/regex'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import axios from 'axios'

const API_URL = 'https://api.qauds.in/api/v2'

const useRegister = () => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const route = useRoute()

  const [name, setName] = useState('')
  const [email, setEmail] = useState(route.params?.email || '')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [avatar, setAvatar] = useState(null)

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

  const handleFileInputChange = (file) => {
    setAvatar(file)
  }

  const registerAction = async () => {
    if (validateCredentials()) {
      try {
        const config = { 
          headers: { 
            "Content-Type": "multipart/form-data"
          } 
        }

        const newForm = new FormData()
        if (avatar) {
          newForm.append("file", {
            uri: avatar.uri,
            type: 'image/jpeg',
            name: 'profile.jpg'
          })
        }
        newForm.append("name", name)
        newForm.append("email", email.toLowerCase().trim())
        newForm.append("password", password)

        const response = await axios.post(
          `${API_URL}/user/create-user`,
          newForm,
          config
        )

        if (response.data) {
          FlashMessage({
            message: response.data.message || t('registrationSuccess'),
          })
          // Reset form
          setName('')
          setEmail('')
          setPassword('')
          setAvatar(null)
          
          navigation.replace('Login', {
            email: email.toLowerCase().trim()
          })
        }
      } catch (error) {
        FlashMessage({
          message: error.response?.data?.message || t('registrationFailed'),
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
    avatar,
    setAvatar,
    handleFileInputChange,
    registerAction,
    themeContext,
    currentTheme
  }
}

export default useRegister
