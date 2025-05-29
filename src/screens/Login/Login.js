// Login.js
import React, { useLayoutEffect } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  TextInput,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
import { useLogin } from './useLogin'
import screenOptions from './screenOptions'
import { useTranslation } from 'react-i18next'

function Login(props) {
  const {
    input,
    setInput,
    password,
    setPassword,
    inputError,
    passwordError,
    loading,
    loginAction,
    currentTheme,
    showPassword,
    setShowPassword,
    themeContext
  } = useLogin()
  const { t } = useTranslation()

  const handleEmailInput = (text) => {
    setInput(text)
  }

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        backColor: currentTheme.themeBackground,
        fontColor: currentTheme.newFontcolor,
        iconColor: currentTheme.newIconColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles().flex}>
        <ScrollView
          style={styles().flex}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}>
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
                  }}>
                  Login
                </TextDefault>
              </View>
              <View style={styles().form}>
                <View>
                  <View>
                    <TextInput
                      placeholder="Enter Email"
                      style={[
                        styles(currentTheme).textField,
                        inputError ? styles(currentTheme).errorInput : {}
                      ]}
                      placeholderTextColor={currentTheme.fontSecondColor}
                      value={input}
                      onChangeText={handleEmailInput}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {inputError && (
                      <TextDefault
                        style={styles().error}
                        bold
                        textColor={currentTheme.textErrorColor}>
                        {inputError}
                      </TextDefault>
                    )}
                  </View>

                  <View style={styles().passwordField}>
                    <TextInput
                      secureTextEntry={showPassword}
                      placeholder={t('password')}
                      style={[
                        styles(currentTheme).textField,
                        styles().passwordInput,
                        passwordError ? styles(currentTheme).errorInput : {}
                      ]}
                      placeholderTextColor={currentTheme.fontSecondColor}
                      value={password}
                      onChangeText={e => setPassword(e)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <FontAwesome
                      onPress={() => setShowPassword(!showPassword)}
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={24}
                      color={
                        passwordError === null
                          ? currentTheme.newFontcolor
                          : currentTheme.textErrorColor
                      }
                      style={[styles().eyeBtn]}
                    />
                  </View>
                  {passwordError && (
                    <View>
                      <TextDefault
                        style={styles().error}
                        bold
                        textColor={currentTheme.textErrorColor}>
                        {passwordError}
                      </TextDefault>
                    </View>
                  )}
                </View>
                <View style={[styles.termsContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                  <TextDefault textColor="black" style={{ textAlign: 'center' }}>
                    * I Agree with all the{' '}
                    <TextDefault
                      textColor="#E5E500"
                      onPress={() => {/* Navigate to Terms */ }}>
                      Terms & Conditions
                    </TextDefault>
                  </TextDefault>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={loginAction}
                    activeOpacity={0.7}
                    style={styles(currentTheme).btn}>
                    <TextDefault
                      H4
                      textColor={currentTheme.black}
                      bold>
                      {loading ? (
                        <Spinner
                          backColor='transparent'
                          spinnerColor={currentTheme.white}
                          size="small"
                        />
                      ) : (
                        t('loginBtn')
                      )}
                    </TextDefault>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Option */}
                <View style={[styles.signupContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                  <TextDefault textColor="black" style={{ textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <TouchableOpacity onPress={() => props.navigation.navigate('Register')}>
                      <TextDefault textColor="#E5E500">
                        Sign Up
                      </TextDefault>
                    </TouchableOpacity>
                  </TextDefault>
                </View>

                {/* Or Divider */}
                <View style={[styles.orContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                  <TextDefault textColor="black" style={{ textAlign: 'center' }}>
                    
                  </TextDefault>
                </View>

                {/* Social Login Divider */}
                {/* <View style={[styles.dividerContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                  <View style={styles.divider} />
                  <TextDefault textColor="black" style={[styles.dividerText, { textAlign: 'center' }]}>
                    or Continue with
                  </TextDefault>
                  <View style={styles.divider} />
                </View> */}

                {/* Social Button */}
                {/* <View style={[styles.socialContainer, { alignItems: 'center', justifyContent: 'center' }]}>
                  <TouchableOpacity style={styles.socialButton}>
                
                    <View style={styles.googleIconPlaceholder}>
                      <View style={styles().logoContainer}>
                        <Image
                          source={require('../../assets/images/google.png')} // Ensure this path is correct
                          style={styles().googlelogo}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View> */}

              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default Login