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

export default function RefundPolicy() {
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
            Refund Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Refund Eligibility
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            {appName} offers refunds under the following circumstances:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Order cancellation before preparation begins{'\n'}
            • Incorrect or missing items in your order{'\n'}
            • Quality issues with delivered food{'\n'}
            • Delivery delays exceeding 30 minutes{'\n'}
            • Technical errors in payment processing{'\n'}
            • Restaurant closure or unavailability
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. Refund Process
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            To request a refund:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            1. Contact our customer support within 24 hours of order completion{'\n'}
            2. Provide your order number and reason for refund{'\n'}
            3. Submit any relevant photos or documentation{'\n'}
            4. Our team will review your request within 48 hours{'\n'}
            5. Approved refunds will be processed within 5-7 business days
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Refund Methods
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            Refunds will be issued through the original payment method:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Credit/Debit Cards: 5-7 business days{'\n'}
            • Digital Wallets: 2-3 business days{'\n'}
            • Bank Transfers: 3-5 business days{'\n'}
            • Cash on Delivery: Credit to your account
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Non-Refundable Items
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            The following are not eligible for refunds:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Orders cancelled after preparation begins{'\n'}
            • Change of mind after delivery{'\n'}
            • Incorrect delivery address provided by customer{'\n'}
            • Customer unavailability at delivery time{'\n'}
            • Delivery fees and service charges
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Partial Refunds
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            In cases where only part of your order is affected, we may offer partial refunds for the specific items or services that were problematic.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            For any questions about our refund policy, please contact our customer support team at {contactEmail}
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