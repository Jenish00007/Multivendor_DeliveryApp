/* eslint-disable react/display-name */
import React from 'react'
import {
  RightButton,
  BackButton
} from '../components/Header/HeaderIcons/HeaderIcons'
import { StyleSheet } from 'react-native'
import { textStyles } from '../utils/textStyles'
import { scale } from '../utils/scaling'
import { useTranslation } from 'react-i18next'
import { useAppBranding } from '../utils/translationHelper'

const screenOptions = props => {
  const { t } = useTranslation()
  const branding = useAppBranding();
  return {
    headerTitleAlign: 'center',
    headerBackTitleVisible: false,
    headerStyle: {
      backgroundColor: branding.primaryColor,
      borderBottomColor: props.lineColor,
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    headerTitleStyle: {
      color: branding.whiteColorText,
      ...textStyles.Bolder,
      ...textStyles.B700,
      backgroundColor: 'transparent'
    },
    headerTitleContainerStyle: {
      marginHorizontal: scale(35)
    },
    headerBackImage: () =>
      BackButton({ iconColor: branding.whiteColorText, icon: 'leftArrow' }),
    headerRight: () => (
      <RightButton icon="cart" iconColor={branding.whiteColorText} menuHeader={false} t={t}/>
    )
  }
}
export default screenOptions
