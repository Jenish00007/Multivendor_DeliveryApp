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

export default function CancellationPolicy() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar backgroundColor="#F16122" barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.fontMainColor }]}>
            Cancellation Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Order Cancellation Window
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Orders can be cancelled within 30 minutes of placing the order
            • For scheduled deliveries, cancellation is allowed up to 2 hours before the delivery time
            • Some items may have different cancellation windows based on their nature
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Cancellation Process
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            To cancel an order:
            1. Go to 'My Orders' in the app
            2. Select the order you wish to cancel
            3. Click on the 'Cancel Order' button
            4. Select a reason for cancellation
            5. Confirm your cancellation
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Cancellation Fees
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • No cancellation fee if cancelled within 5 minutes of ordering
            • 5% cancellation fee if cancelled after 5 minutes but before vendor acceptance
            • 15% cancellation fee if cancelled after vendor acceptance but before preparation
            • Orders cannot be cancelled once preparation begins
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Refund for Cancelled Orders
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Full refund for cancellations within 5 minutes
            • Refund minus cancellation fee for other eligible cancellations
            • Refund will be processed to the original payment method
            • Processing time: 5-7 business days
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Non-Cancellable Orders
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            The following orders cannot be cancelled:
            • Custom-made items
            • Orders in preparation or shipping
            • Perishable items
            • Special category items marked as non-cancellable
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Vendor Cancellation
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            If a vendor cancels your order:
            • You will receive a full refund
            • Additional compensation may be provided
            • Alternative options will be suggested
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            7. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For any questions about our cancellation policy or assistance with cancelling an order, please contact our customer support team at cancellations@Qauds.com
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