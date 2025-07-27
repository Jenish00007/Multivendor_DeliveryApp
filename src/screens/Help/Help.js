import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { useContext } from 'react';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';
import { useConfiguration } from '../../context/Configuration';
import { getContactEmail, getContactPhone } from '../../services/configService';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppBranding } from '../../utils/translationHelper';

export default function Help() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useConfiguration();
  const branding = useAppBranding();
  
  const contactEmail = getContactEmail(configuration.config);
  const contactPhone = getContactPhone(configuration.config);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.themeBackground,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 15,
    },
    faqItem: {
      backgroundColor: currentTheme.itemCardColor,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 8,
    },
    faqAnswer: {
      fontSize: 14,
      color: currentTheme.fontSecondColor,
      lineHeight: 20,
    },
    contactSection: {
      backgroundColor: currentTheme.itemCardColor,
      padding: 20,
      borderRadius: 10,
    },
    contactTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 15,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.themeBackground,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    contactIcon: {
      marginRight: 15,
    },
    contactText: {
      fontSize: 16,
      color: currentTheme.fontMainColor,
    },
  });

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${contactEmail}`);
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${contactPhone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={branding.primaryColor} barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I track my order?</Text>
            <Text style={styles.faqAnswer}>
              You can track your order in real-time through the "My Orders" section of the app. 
              Once your order is placed, you'll receive updates about its status.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, debit cards, and digital payment methods. 
              Some restaurants may also accept cash on delivery.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I change my delivery address?</Text>
            <Text style={styles.faqAnswer}>
              You can update your delivery address in the "Profile" section of the app. 
              Make sure to save the new address before placing your next order.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What if my order is delayed?</Text>
            <Text style={styles.faqAnswer}>
              If your order is delayed, you'll receive real-time updates. In case of significant delays, 
              our customer support team will contact you to provide assistance.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I report an issue with my order?</Text>
            <Text style={styles.faqAnswer}>
              You can report issues through the "My Orders" section by selecting the specific order 
              and using the "Report Issue" option. Our support team will assist you promptly.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel my order?</Text>
            <Text style={styles.faqAnswer}>
              Orders can be cancelled within a limited time window after placement. 
              Check the order details for cancellation options and time limits.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I provide feedback?</Text>
            <Text style={styles.faqAnswer}>
              You can provide feedback through the app by rating your order and leaving comments. 
              You can also give a rating to the restaurant and leave a review.
            </Text>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Support</Text>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <MaterialIcon 
              name="email" 
              size={24} 
              color="#F16122" 
              style={styles.contactIcon}
            />
            <Text style={styles.contactText}>Email: {contactEmail}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
            <MaterialIcon 
              name="phone" 
              size={24} 
              color="#F16122" 
              style={styles.contactIcon}
            />
            <Text style={styles.contactText}>Phone: {contactPhone}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
