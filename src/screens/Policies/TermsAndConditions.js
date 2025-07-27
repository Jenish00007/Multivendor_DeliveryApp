import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useContext } from 'react';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';
import { useConfiguration } from '../../context/Configuration';
import { getAppName, getContactEmail } from '../../services/configService';
import { useAppBranding } from '../../utils/translationHelper';

export default function TermsAndConditions() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useConfiguration();
  const branding = useAppBranding();
  
  const appName = getAppName(configuration.config);
  const contactEmail = getContactEmail(configuration.config);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar backgroundColor={branding.primaryColor} barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.fontMainColor }]}>
            Terms and Conditions
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Welcome to {appName}! By accessing or using our mobile application, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our service.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Use of Service
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
          {appName} provides a multivendor marketplace platform connecting customers with various vendors. Users must be at least 18 years old to create an account and use our services.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Orders and Payments
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            By placing an order through {appName}, you agree to pay all charges at the prices listed. All payments must be made through our approved payment methods. Prices and availability are subject to change.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Delivery
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Delivery times are estimates and may vary based on location and other factors. {appName} is not responsible for delays caused by circumstances beyond our control.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Modifications
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the app. Your continued use of {appName} constitutes acceptance of any modifications.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            7. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            If you have any questions about these Terms and Conditions, please contact us at {contactEmail}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
}); 