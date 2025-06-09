import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Text,
  Image,
  StatusBar,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import { FontAwesome } from '@expo/vector-icons'
import useRegister from './useRegister'
import { useTranslation } from 'react-i18next'
import FlashMessage, { showMessage } from 'react-native-flash-message'
import * as ImagePicker from 'expo-image-picker'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import { API_URL } from '../../config/api'
import { useNavigation } from '@react-navigation/native'

const DEFAULT_AVATAR = 'https://static.vecteezy.com/system/resources/previews/024/183/535/original/male-avatar-portrait-of-a-young-man-with-glasses-illustration-of-male-character-in-modern-color-style-vector.jpg'

function Register(props) {
  const {
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
    currentTheme,
    themeContext,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    vehicleType,
    setVehicleType,
    vehicleNumber,
    setVehicleNumber,
    licenseNumber,
    setLicenseNumber,
    idProof,
    setIdProof,
    loading,
    setLoading
  } = useRegister()

  const { t } = useTranslation()
  const navigation = useNavigation()

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showMessage({
          message: "Sorry, we need camera roll permissions to upload ID proof!",
          type: "danger"
        });
        return;
      }

      // Launch image picker with correct mediaTypes configuration
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdProof(result.assets[0]);
        console.log("Image selected:", result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showMessage({
        message: "Error selecting image. Please try again.",
        type: "danger"
      });
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true)
      console.log("Starting registration process...")

      // Validate form
      if (!validateForm()) {
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('phoneNumber', phoneNumber)
      formData.append('address', address)
      formData.append('vehicleType', vehicleType)
      formData.append('vehicleNumber', vehicleNumber)
      formData.append('licenseNumber', licenseNumber)

      // Add ID proof if selected
      if (idProof) {
        console.log("Adding ID proof to form data")
        formData.append('idProof', {
          uri: Platform.OS === 'ios' ? idProof.uri.replace('file://', '') : idProof.uri,
          type: 'image/jpeg',
          name: 'id_proof.jpg'
        })
      } else {
        console.log("No ID proof selected")
        showMessage({
          message: "Please select an ID proof document",
          type: "danger"
        })
        setLoading(false)
        return
      }

      console.log("Sending registration request...")
      const response = await fetch(`${API_URL}/deliveryman/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      const responseData = await response.json()
      console.log("Registration response:", responseData)

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed')
      }

      if (responseData.success) {
        showMessage({
          message: "Registration successful! Please wait for admin approval.",
          type: "success"
        })
        
        // Clear form data
        setName('')
        setEmail('')
        setPassword('')
        setPhoneNumber('')
        setAddress('')
        setVehicleType('')
        setVehicleNumber('')
        setLicenseNumber('')
        setIdProof(null)
        
        // Navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      } else {
        throw new Error(responseData.message || 'Registration failed')
      }
    } catch (error) {
      console.error("Registration error:", error)
      showMessage({
        message: error.message || "Registration failed. Please try again.",
        type: "danger"
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    // Check all required fields
    if (!name || !email || !password || !phoneNumber || !address || !vehicleType || !vehicleNumber || !licenseNumber) {
      showMessage({
        message: "Please fill in all fields",
        type: "danger"
      })
      return false
    }

    if (!idProof) {
      showMessage({
        message: "Please select an ID proof document",
        type: "danger"
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showMessage({
        message: "Please enter a valid email address",
        type: "danger"
      })
      return false
    }

    // Password validation
    if (password.length < 6) {
      showMessage({
        message: "Password must be at least 6 characters long",
        type: "danger"
      })
      return false
    }

    // Phone number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phoneRegex.test(phoneNumber)) {
      showMessage({
        message: "Please enter a valid phone number",
        type: "danger"
      })
      return false
    }

    return true
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles().flex, { backgroundColor: currentTheme.themeBackground }]}
    >
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().flex}
      >
        <ScrollView
          style={styles().flex}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
        >
          <View style={styles(currentTheme).mainContainer}>
            <View style={styles().subContainer}>
           
              <View>
                <TextDefault
                  H3
                  bolder
                  textColor={currentTheme.newFontcolor}
                  style={{
                    ...alignment.MTlarge,
                    ...alignment.MBmedium
                  }}
                >
                  {t('letsGetStarted')}
                </TextDefault>
                <TextDefault
                  H5
                  bold
                  textColor={currentTheme.fontSecondColor}
                  style={{ ...alignment.PBmedium }}
                >
                  {t('createAccount')}
                </TextDefault>
              </View>

              <View style={styles().form}>
                {/* Name Field */}
                <View>
                  <TextInput
                    placeholder={t('Name')}
                    style={[
                      styles(currentTheme).textField,
                      nameError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={name}
                    onChangeText={setName}
                  />
                  {nameError && (
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {nameError}
                    </TextDefault>
                  )}
                </View>

                {/* Email Field */}
                <View>
                  <TextInput
                    placeholder={t('email')}
                    style={[
                      styles(currentTheme).textField,
                      emailError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />
                  {emailError && (
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {emailError}
                    </TextDefault>
                  )}
                </View>

                {/* Password Field */}
                <View style={styles().passwordField}>
                  <TextInput
                    secureTextEntry={!visible}
                    placeholder={t('password')}
                    style={[
                      styles(currentTheme).textField,
                      styles().passwordInput,
                      passwordError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setVisible(!visible)}>
                    <FontAwesome
                      name={visible ? 'eye' : 'eye-slash'}
                      size={24}
                      color={currentTheme.fontFourthColor}
                      style={styles().eyeBtn}
                    />
                  </TouchableOpacity>
                </View>

                {/* Phone Number Field */}
                <View>
                  <TextInput
                    placeholder={t('Phone Number')}
                    style={styles(currentTheme).textField}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Address Field */}
                <View>
                  <TextInput
                    placeholder={t('Address')}
                    style={styles(currentTheme).textField}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>

                {/* Vehicle Type Field */}
                <View>
                  <TextInput
                    placeholder={t('Vehicle Type')}
                    style={styles(currentTheme).textField}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={vehicleType}
                    onChangeText={setVehicleType}
                  />
                </View>

                {/* Vehicle Number Field */}
                <View>
                  <TextInput
                    placeholder={t('Vehicle Number')}
                    style={styles(currentTheme).textField}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={vehicleNumber}
                    onChangeText={setVehicleNumber}
                  />
                </View>

                {/* License Number Field */}
                <View>
                  <TextInput
                    placeholder={t('License Number')}
                    style={styles(currentTheme).textField}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                  />
                </View>

                {/* ID Proof Upload */}
                <TouchableOpacity
                  style={styles(currentTheme).uploadButton}
                  onPress={pickImage}
                >
                  <TextDefault H5 textColor={currentTheme.black}>
                    {idProof ? 'Change ID Proof' : 'Upload ID Proof'}
                  </TextDefault>
                </TouchableOpacity>

                {idProof && (
                  <View style={styles().imagePreview}>
                    <Image
                      source={{ uri: idProof.uri }}
                      style={styles().previewImage}
                    />
                  </View>
                )}
              </View>
            </View>

            <View style={styles().btnContainer}>
              <TouchableOpacity
                onPress={handleRegister}
                activeOpacity={0.7}
                style={[
                  styles(currentTheme).btn,
                  loading && styles(currentTheme).disabledBtn
                ]}
                disabled={loading}
              >
                <TextDefault H4 textColor={currentTheme.black} bold>
                  {loading ? t('registering') : t('createAccount')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <FlashMessage position="top" />
    </SafeAreaView>
  )
}

export default Register
