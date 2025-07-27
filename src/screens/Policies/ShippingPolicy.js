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

export default function ShippingPolicy() {
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
            Shipping & Delivery Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Delivery Areas
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            {appName} currently delivers to:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Major cities and metropolitan areas{'\n'}
            • Suburban areas within service radius{'\n'}
            • Select rural areas with partner coverage{'\n'}
            • International locations (subject to availability)
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Delivery Timeframes
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Standard delivery times:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Local deliveries: 30-45 minutes{'\n'}
            • Suburban deliveries: 45-60 minutes{'\n'}
            • Peak hours: May extend by 15-30 minutes{'\n'}
            • Special orders: As communicated during ordering
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Delivery Fees
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Delivery fees vary based on:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Distance from restaurant to delivery address{'\n'}
            • Order value and minimum order requirements{'\n'}
            • Peak hours and demand{'\n'}
            • Special delivery requests
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Order Tracking
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Track your order through:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • {appName} mobile app{'\n'}
            • Real-time GPS tracking{'\n'}
            • SMS and push notifications{'\n'}
            • Customer support hotline
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Delivery Instructions
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            To ensure smooth delivery:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Provide accurate delivery address{'\n'}
            • Include building codes or access instructions{'\n'}
            • Ensure someone is available to receive the order{'\n'}
            • Keep your phone accessible for delivery updates
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For questions about our shipping policy or to track an order, contact our delivery support team at {contactEmail}
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