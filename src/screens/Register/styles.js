import { StyleSheet, Dimensions } from 'react-native'
import { alignment } from '../../utils/alignment'
import { scale } from '../../utils/scaling'

const { width } = Dimensions.get('window')

const styles = (theme = {}) =>
  StyleSheet.create({
    flex: {
      flex: 1
    },
    mainContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: width * 0.05
    },
    subContainer: {
      width: '100%',
      alignItems: 'center'
    },
    marginTop10: {
      ...alignment.MTlarge
    },
    marginTop5: {
      ...alignment.MTsmall
    },
    marginTop3: {
      ...alignment.MTxSmall
    },
    alignItemCenter: {
      alignItems: 'center'
    },
    twoContainers: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    width48: {
      width: '48%'
    },
    logoContainer: {
      width: '100%',
      alignItems: 'center',
      ...alignment.MTlarge
    },
    logo: {
      width: width * 0.4,
      height: width * 0.4,
      resizeMode: 'contain'
    },
    form: {
      width: '100%',
      ...alignment.MTlarge
    },
    textField: {
      backgroundColor: theme.inputBackground || '#FFFFFF',
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      color: theme.newFontcolor || '#000000'
    },
    errorInput: {
      borderWidth: 1,
      borderColor: theme.textErrorColor || '#FF0000'
    },
    error: {
      marginTop: -10,
      marginBottom: 10,
      marginLeft: 5
    },
    passwordField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground || '#FFFFFF',
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15
    },
    passwordInput: {
      flex: 1,
      paddingVertical: 12,
      marginBottom: 0
    },
    eyeBtn: {
      padding: 10
    },
    number: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    countryCode: {
      width: '25%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 10
    },
    phoneNumber: {
      width: '70%'
    },
    phoneFieldInner: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    phoneField: {
      flex: 1,
      paddingVertical: 12,
      color: theme.newFontcolor || '#000000'
    },
    btnContainer: {
      width: '100%',
      ...alignment.MBmedium
    },
    btn: {
      width: '100%',
      height: 50,
      backgroundColor: theme.buttonBackground || '#000000',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    avatarContainer: {
      alignItems: 'center',
      marginVertical: 20
    },
    avatarButton: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
      backgroundColor: theme.inputBackground || '#FFFFFF'
    },
    avatar: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover'
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.inputBackground || '#FFFFFF'
    },
    headerLeftIcon: {
      ...alignment.PLsmall
    },
    headerRightIcon: {
      ...alignment.PRsmall
    }
  })

export default styles
