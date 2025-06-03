import { Dimensions, StyleSheet } from 'react-native';
import { verticalScale, scale } from '../../utils/scaling';
import { fontStyles } from '../../utils/fontStyles';
import { theme } from '../../utils/themeColors'
const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  footerContainer: {
    width,
    height: height * 0.08,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5'
    
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
    color: theme.Figgo.yellow,
    fontSize: 10,
    fontFamily: fontStyles.PoppinsBold,
    fontWeight: 'bold',
  },
  inactiveText: {
    marginTop: verticalScale(4),
    color: theme.Dark.darkGrayText,
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
    backgroundColor: theme.greenColor,
    borderRadius: verticalScale(4),
  },
  badgeContainer: {
    position: 'absolute',
    top: -scale(5),
    right: -scale(10),
    backgroundColor: theme.redColor,
    borderRadius: scale(10),
    height: scale(16),
    width: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.white,
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

export default styles;
