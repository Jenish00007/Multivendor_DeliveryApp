import React, { useContext } from 'react'
import ThemeContext from '../ui/ThemeContext/ThemeContext'
import ConfigurationContext from '../context/Configuration'
import { theme } from './themeColors'
import Constants from 'expo-constants'

export const useAppBranding = () => {
  const themeContext = useContext(ThemeContext)
  const configuration = useContext(ConfigurationContext)
  const themeValue = themeContext?.ThemeValue || 'Pink'
  const currentTheme = theme[themeValue] || theme.Pink || theme.Dark
  
  // Get configuration data from service
  const contactInfo = configuration?.getContactInfo?.() || {}
  const homepageContent = configuration?.getHomepageContent?.() || {}
  const appConfig = Constants.expoConfig || {}
  
  // Ensure currentTheme has all required properties with fallbacks
  const safeTheme = {
    secondaryBackground: currentTheme?.secondaryBackground || '#ECECEC',
    tagColor: currentTheme?.tagColor || appConfig.splash?.backgroundColor,
    fontMainColor: currentTheme?.fontMainColor || '#212121',
    themeBackground: currentTheme?.themeBackground || '#fff',
    primaryColor: currentTheme?.primary || appConfig.splash?.backgroundColor
  }
  
  return {
    appName: appConfig.name,
    primaryColor: appConfig.splash?.backgroundColor,
    secondaryColor: safeTheme.secondaryBackground,
    headerColor: appConfig.splash?.backgroundColor,
    whiteColorText: '#fff',
    accentColor: safeTheme.secondaryBackground,
    textColor: safeTheme.fontMainColor,
    backgroundColor: safeTheme.themeBackground,
    buttonColor: appConfig.splash?.backgroundColor,
    logo: require('../../assets/figgo/icon.png'),
    splashLogo: require('../../assets/figgo/icon.png'),   
    appLogo: require('../../assets/figgo/icon.png'),
    contactInfo: {
      email: contactInfo?.email || '',
      phone: contactInfo?.phone || ''
    },
    homepageContent: {
      title: homepageContent?.title || 'Welcome',
      description: homepageContent?.description || 'Your trusted marketplace'
    },
    cartCardBackground: safeTheme.secondaryBackground,
    cartCardBorder: safeTheme.fontMainColor,
    cartPriceColor: safeTheme.primaryColor,
    cartDiscountColor: safeTheme.primaryColor,
    cartDeleteColor: safeTheme.primaryColor,
    cartQuantityButtonBg: safeTheme.primaryColor,
    cartQuantityButtonText: safeTheme.fontMainColor,
    cartTotalSectionBg: safeTheme.secondaryBackground,
    cartDividerColor: safeTheme.fontMainColor,
    // Add more branding properties as needed
  }
}

export default useAppBranding 