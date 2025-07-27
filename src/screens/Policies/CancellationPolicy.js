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

export default function CancellationPolicy() {
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
            Cancellation Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Order Cancellation Windows
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            {appName} allows order cancellations within specific timeframes:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Before preparation begins: Full refund{'\n'}
            • During preparation: Partial refund (50%){'\n'}
            • After preparation: No refund{'\n'}
            • During delivery: No refund
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. How to Cancel an Order
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            To cancel your order:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            1. Go to "My Orders" in the app{'\n'}
            2. Select the order you want to cancel{'\n'}
            3. Tap "Cancel Order" button{'\n'}
            4. Confirm cancellation{'\n'}
            5. Contact support if cancellation option is unavailable
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Cancellation Fees
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Cancellation fees may apply:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • No fee: Cancellation before preparation{'\n'}
            • 50% of order value: During preparation{'\n'}
            • Full order value: After preparation or during delivery{'\n'}
            • Additional fees: Special orders or custom items
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Restaurant-Initiated Cancellations
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Restaurants may cancel orders due to:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Item unavailability{'\n'}
            • Kitchen closure{'\n'}
            • Technical issues{'\n'}
            • Capacity limitations
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Full refunds will be issued for restaurant-initiated cancellations.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Refund Processing
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Refunds for cancelled orders:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Will be processed within 5-7 business days{'\n'}
            • Issued to original payment method{'\n'}
            • Include any applicable delivery fees{'\n'}
            • May take longer for international transactions
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For questions about our cancellation policy, please contact our customer support team at {contactEmail}
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