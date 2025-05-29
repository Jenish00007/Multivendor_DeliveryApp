import React, { useLayoutEffect } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Text,
  Image,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import screenOptions from './screenOptions'
import { FontAwesome } from '@expo/vector-icons'
import useRegister from './useRegister'
import { useTranslation } from 'react-i18next'

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
    avatar,
    setAvatar,
    handleFileInputChange,
    registerAction,
    currentTheme,
    themeContext
  } = useRegister()

  const { t } = useTranslation()

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      FlashMessage({
        message: t('permissionDenied'),
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    })

    if (!result.canceled) {
      handleFileInputChange(result.assets[0])
    }
  }

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        fontColor: currentTheme.newFontcolor,
        backColor: currentTheme.themeBackground,
        iconColor: currentTheme.newIconColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

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
              <View style={styles().logoContainer}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles().logo}
                />
              </View>
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

              {/* Avatar Upload Section */}
              <View style={styles().avatarContainer}>
                <TouchableOpacity onPress={pickImage} style={styles().avatarButton}>
                  {avatar ? (
                    <Image source={{ uri: avatar.uri }} style={styles().avatar} />
                  ) : (
                    <View style={styles().avatarPlaceholder}>
                      <FontAwesome name="user" size={40} color={currentTheme.fontSecondColor} />
                    </View>
                  )}
                </TouchableOpacity>
                <TextDefault
                  H5
                  textColor={currentTheme.fontSecondColor}
                  style={{ ...alignment.MTsmall }}
                >
                  {t('uploadPhoto')}
                </TextDefault>
              </View>

              <View style={styles().form}>
                <View>
                  <TextInput
                    placeholder={t('email')}
                    style={[
                      styles(currentTheme).textField,
                      emailError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={email}
                    onChangeText={(e) => setEmail(e)}
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
                <View>
                  <TextInput
                    placeholder={t('Name')}
                    style={[
                      styles(currentTheme).textField,
                      nameError && styles(currentTheme).errorInput
                    ]}
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={name}
                    onChangeText={(e) => setName(e)}
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
                    onChangeText={(e) => setPassword(e)}
                  />
                  <View>
                    <FontAwesome
                      onPress={() => setVisible(!visible)}
                      name={visible ? 'eye' : 'eye-slash'}
                      size={24}
                      color={currentTheme.fontFourthColor}
                      style={styles().eyeBtn}
                    />
                  </View>
                </View>
                {passwordError && (
                  <View>
                    <TextDefault
                      style={styles().error}
                      bold
                      textColor={currentTheme.textErrorColor}
                    >
                      {passwordError}
                    </TextDefault>
                  </View>
                )}
              </View>
            </View>
            <View style={styles().btnContainer}>
              <TouchableOpacity
                onPress={() => registerAction()}
                activeOpacity={0.7}
                style={styles(currentTheme).btn}
              >
                <TextDefault H4 textColor={currentTheme.black} bold>
                  {t('createAccount')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Register
