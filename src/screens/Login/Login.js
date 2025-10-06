// Login.js
import React, { useLayoutEffect } from 'react'
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import Spinner from '../../components/Spinner/Spinner'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import Logo from '../../components/Logo/Logo'
import { alignment } from '../../utils/alignment'
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons'
import { useLogin } from './useLogin'
import screenOptions from './screenOptions'
import { useTranslation } from 'react-i18next'
import { useConfiguration } from '../../context/Configuration'
import { useAppBranding } from '../../utils/translationHelper'

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
  const { appName } = useConfiguration()
  const branding = useAppBranding()

  const handleEmailInput = (text) => {
    setInput(text)
  }

  useLayoutEffect(() => {
    props.navigation.setOptions(
      screenOptions({
        backColor: branding.backgroundColor,
        fontColor: branding.textColor,
        iconColor: branding.textColor,
        navigation: props.navigation
      })
    )
  }, [props.navigation])

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[
        styles(currentTheme).safeAreaViewStyles,
        { backgroundColor: branding.backgroundColor }
      ]}
    >
      <StatusBar
        backgroundColor={branding.primaryColor}
        barStyle='dark-content'
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
          <View
            style={[
              styles(currentTheme).mainContainer,
              { backgroundColor: branding.backgroundColor }
            ]}
          >
            <View style={styles().subContainer}>
              <View style={styles().logoContainer}>
                <Logo style={styles().logo} />
              </View>
              <View>
                <TextDefault
                  H3
                  bolder
                  textColor={branding.textColor}
                  style={{
                    ...alignment.MTlarge,
                    ...alignment.MBmedium
                  }}
                >
                  {appName || 'Delivery Partner Login'}
                </TextDefault>
              </View>
              <View style={styles().form}>
                <View>
                  <View>
                    <TextInput
                      placeholder='Enter Email'
                      style={[
                        styles(currentTheme).textField,
                        {
                          backgroundColor: branding.backgroundColor,
                          color: branding.textColor,
                          borderColor: inputError
                            ? branding.cartDeleteColor
                            : branding.secondaryBackground
                        },
                        inputError ? styles(currentTheme).errorInput : {}
                      ]}
                      placeholderTextColor={branding.textColor}
                      value={input}
                      onChangeText={handleEmailInput}
                      keyboardType='email-address'
                      autoCapitalize='none'
                      autoCorrect={false}
                    />
                    {inputError && (
                      <TextDefault
                        style={styles().error}
                        bold
                        textColor={branding.cartDeleteColor}
                      >
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
                        {
                          backgroundColor: branding.backgroundColor,
                          color: branding.textColor,
                          borderColor: passwordError
                            ? branding.cartDeleteColor
                            : branding.secondaryBackground
                        },
                        passwordError ? styles(currentTheme).errorInput : {}
                      ]}
                      placeholderTextColor={branding.textColor}
                      value={password}
                      onChangeText={(e) => setPassword(e)}
                      autoCapitalize='none'
                      autoCorrect={false}
                    />
                    <FontAwesome
                      onPress={() => setShowPassword(!showPassword)}
                      name={showPassword ? 'eye' : 'eye-slash'}
                      size={24}
                      color={
                        passwordError === null
                          ? branding.textColor
                          : branding.cartDeleteColor
                      }
                      style={[styles().eyeBtn]}
                    />
                  </View>
                  {passwordError && (
                    <View>
                      <TextDefault
                        style={styles().error}
                        bold
                        textColor={branding.cartDeleteColor}
                      >
                        {passwordError}
                      </TextDefault>
                    </View>
                  )}
                </View>
                <View
                  style={[
                    styles.termsContainer,
                    { alignItems: 'center', justifyContent: 'center' }
                  ]}
                >
                  <TextDefault
                    textColor={branding.textColor}
                    style={{ textAlign: 'center' }}
                  >
                    * By logging in, you agree to our{' '}
                    <TextDefault
                      textColor={branding.primaryColor}
                      onPress={() => {
                        /* Navigate to Terms */
                      }}
                    >
                      Terms & Conditions
                    </TextDefault>{' '}
                    and{' '}
                    <TextDefault
                      textColor={branding.primaryColor}
                      onPress={() => {
                        /* Navigate to Privacy Policy */
                      }}
                    >
                      Privacy Policy
                    </TextDefault>
                  </TextDefault>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={loginAction}
                    activeOpacity={0.7}
                    style={[
                      styles(currentTheme).btn,
                      { backgroundColor: branding.primaryColor }
                    ]}
                  >
                    <TextDefault H4 textColor={branding.whiteColorText} bold>
                      {loading ? (
                        <Spinner
                          backColor='transparent'
                          spinnerColor={branding.whiteColorText}
                          size='small'
                        />
                      ) : (
                        t('loginBtn')
                      )}
                    </TextDefault>
                  </TouchableOpacity>
                </View>

                {/* Or Divider */}
                <View
                  style={[
                    styles.orContainer,
                    { alignItems: 'center', justifyContent: 'center' }
                  ]}
                >
                  <TextDefault
                    textColor={branding.textColor}
                    style={{ textAlign: 'center' }}
                  ></TextDefault>
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
