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

export default function About() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useConfiguration();
  const branding = useAppBranding();
  
  const appName = getAppName(configuration.config);
  const contactEmail = getContactEmail(configuration.config);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.themeBackground,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 10,
    },
    version: {
      fontSize: 16,
      color: currentTheme.fontSecondColor,
      marginBottom: 20,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: currentTheme.fontSecondColor,
      textAlign: 'center',
      marginBottom: 30,
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
    sectionText: {
      fontSize: 16,
      lineHeight: 24,
      color: currentTheme.fontSecondColor,
      marginBottom: 15,
    },
    missionSection: {
      backgroundColor: currentTheme.itemCardColor,
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
    },
    missionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.fontMainColor,
      marginBottom: 10,
    },
    missionText: {
      fontSize: 16,
      lineHeight: 24,
      color: currentTheme.fontSecondColor,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={branding.primaryColor} barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            {appName} is a comprehensive delivery partner app that connects delivery personnel with customers, 
            providing efficient and reliable delivery services across various locations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {appName}</Text>
          <Text style={styles.sectionText}>
            {appName} Partner is designed to streamline the delivery process, making it easier for delivery 
            personnel to manage orders, track deliveries, and provide excellent customer service.
          </Text>
          <Text style={styles.sectionText}>
            Our platform ensures that delivery partners have all the tools they need to succeed, 
            from real-time order tracking to efficient route optimization.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            To provide delivery partners with a seamless, efficient, and user-friendly platform that 
            enhances their ability to deliver exceptional service to customers while maximizing their earnings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <Text style={styles.sectionText}>
            • Real-time order notifications{'\n'}
            • GPS tracking and route optimization{'\n'}
            • Easy order management{'\n'}
            • Earnings tracking and analytics{'\n'}
            • Customer communication tools{'\n'}
            • Flexible working hours
          </Text>
        </View>

        <View style={styles.missionSection}>
          <Text style={styles.missionTitle}>Contact Us</Text>
          <Text style={styles.missionText}>
            Have questions or feedback? We'd love to hear from you!{'\n\n'}
            Email: {contactEmail}{'\n'}
            Address: Chennai, Tamil Nadu, India
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}