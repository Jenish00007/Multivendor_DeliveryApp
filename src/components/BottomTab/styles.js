import { Dimensions, StyleSheet } from 'react-native';
import { verticalScale, scale } from '../../utils/scaling';
import { fontStyles } from '../../utils/fontStyles';

const { height, width } = Dimensions.get('window');

const createStyles = (branding) => {
  return StyleSheet.create({
    footerContainer: {
      width,
      height: height * 0.08,
      flexDirection: 'row',
      backgroundColor: branding.backgroundColor
      
    },
    footerBtnContainer: {
      width: '25%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    
    },
    imgContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeText: {
      marginTop: verticalScale(4),
      color: branding.primaryColor,
      fontSize: 10,
      fontFamily: fontStyles.PoppinsBold,
      fontWeight: 'bold',
    },
    inactiveText: {
      marginTop: verticalScale(4),
      color: branding.textColor,
      fontSize: 10,
      fontFamily: fontStyles.PoppinsRegular,
      fontWeight: 'bold',
    },
    profileContainer: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    profileBadge: {
      width: verticalScale(8),
      height: verticalScale(8),
      position: 'absolute',
      right: '25%',
      top: 0,
      backgroundColor: branding.primaryColor,
      borderRadius: verticalScale(4),
    },
    badgeContainer: {
      position: 'absolute',
      top: -scale(5),
      right: -scale(10),
      backgroundColor: branding.cartDeleteColor,
      borderRadius: scale(10),
      height: scale(16),
      width: scale(16),
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      color: branding.whiteColorText,
      fontSize: scale(10),
      fontWeight: 'bold',
    },
    iconContainer: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25, 
     
    },
  });
};

export default createStyles;
