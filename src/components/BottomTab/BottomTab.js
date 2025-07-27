import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import createStyles from './styles';
import UserContext from '../../context/User';
import { scale } from '../../utils/scaling'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useAppBranding } from '../../utils/translationHelper';

function BottomTab({ screen }) {
  const navigation = useNavigation();
  const { isLoggedIn, cartCount, orders } = useContext(UserContext);
  const branding = useAppBranding();
  const styles = createStyles(branding);

  const getIconColor = (currentScreen) => {
    return screen === currentScreen ? branding.primaryColor : branding.textColor;
  };

  const getTextStyle = (currentScreen) => {
    return screen === currentScreen ? styles.activeText : styles.inactiveText;
  };

  return (
    <View style={styles.footerContainer}>
      {/* Home Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Menu');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="home" // Solid green icon
          size={scale(20)}
          color={getIconColor('HOME')}
        />
        <Text style={getTextStyle('HOME')}>Home</Text>
      </TouchableOpacity>

      


      {/* Orders Button */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('MyOrders');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="note"
          size={scale(20)}
          color={getIconColor('ORDERS')}
        />
        <Text style={getTextStyle('ORDERS')}>Orders</Text>
      </TouchableOpacity>
      
      {/* Cart Button */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('OrderHistoryScreen');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <MaterialCommunityIcons
          name="history"
          size={scale(20)}
          color={getIconColor('HISTORY')}
        />
        <Text style={getTextStyle('HISTORY')}>History</Text>
      </TouchableOpacity>

      {/* Profile Icon */}
      <TouchableOpacity
        onPress={() => {
          if (isLoggedIn) {
            navigation.navigate('Profile');
          } else {
            navigation.navigate('Login');
          }
        }}
        style={styles.footerBtnContainer}
      >
        <View style={styles.profileContainer}>
          <MaterialCommunityIcons
            name="menu"
            size={scale(20)}
            color={getIconColor('PROFILE')}
          />

        </View>
        <Text style={getTextStyle('PROFILE')}>Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

export default BottomTab;
