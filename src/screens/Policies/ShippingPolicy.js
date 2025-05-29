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

export default function ShippingPolicy() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar backgroundColor="#F16122" barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.fontMainColor }]}>
            Shipping Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Delivery Areas
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
          Qauds currently delivers to:
            • Major cities and metropolitan areas
            • Selected suburban areas
            • Specific rural locations (subject to availability)
            
            Check your location in the app to confirm delivery availability.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Delivery Times
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Standard delivery times:
            • Urban areas: 30-45 minutes
            • Suburban areas: 45-60 minutes
            • Peak hours may require additional time
            • Adverse weather conditions may affect delivery times
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Shipping Fees
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Shipping fees are calculated based on:
            • Distance from vendor to delivery location
            • Order value
            • Time of day (peak/off-peak)
            • Special handling requirements
            
            Free delivery may be available on orders above a certain value.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Order Tracking
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Track your order in real-time through:
            • Qauds mobile app
            • SMS updates
            • Email notifications
            
            Contact support if you experience any issues with tracking.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Delivery Instructions
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            You can provide:
            • Specific drop-off instructions
            • Building access codes
            • Preferred entrance information
            • Contact preferences
            
            Please ensure accurate delivery information to avoid delays.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Failed Deliveries
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            If a delivery fails due to:
            • Incorrect address
            • Customer unavailability
            • Access issues
            
            A redelivery fee may apply or the order may be cancelled with applicable fees.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            7. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For questions about our shipping policy or to track an order, contact our delivery support team at shipping@Qauds.com
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