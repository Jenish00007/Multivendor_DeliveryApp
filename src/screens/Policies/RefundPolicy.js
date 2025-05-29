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

export default function RefundPolicy() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar backgroundColor="#F16122" barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.fontMainColor }]}>
            Refund Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Refund Eligibility
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
          Qauds offers refunds under the following circumstances:
            • Incorrect or damaged items received
            • Missing items from your order
            • Quality issues with received products
            • Service not provided as described
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Refund Process
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            To request a refund:
            1. Contact our customer support within 24 hours of delivery
            2. Provide order details and reason for refund
            3. Submit clear photos if applicable
            4. Wait for our team to review your request
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Refund Timeline
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Once approved, refunds will be processed within 5-7 business days. The time for the refund to appear in your account depends on your payment method and financial institution.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Non-Refundable Items
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            The following are not eligible for refunds:
            • Completed service orders
            • Perishable items
            • Customized products
            • Items marked as non-refundable
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Partial Refunds
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Partial refunds may be offered in cases where only part of the order is affected or when service delivery was partially completed.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Cancellation Refunds
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Orders cancelled before processing or shipping will be refunded in full. Orders cancelled after processing may be subject to cancellation fees.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            7. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For any questions about our refund policy, please contact our customer support team at refunds@Qauds.com
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