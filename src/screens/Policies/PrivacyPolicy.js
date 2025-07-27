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

export default function PrivacyPolicy() {
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
            Privacy Policy
          </Text>
          
          <Text style={[styles.lastUpdated, { color: currentTheme.fontSecondColor }]}>
            Last Updated: March 23, 2024
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            At {appName}, we collect various types of information to provide and improve our service:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Personal Information: Name, email address, phone number, delivery address{'\n'}
            • Device Information: Device type, operating system, unique device identifiers{'\n'}
            • Location Information: GPS coordinates for delivery services{'\n'}
            • Usage Information: App usage patterns, order history, preferences{'\n'}
            • Payment Information: Payment method details (processed securely)
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We use the collected information for:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Processing and delivering your orders{'\n'}
            • Providing customer support and communication{'\n'}
            • Improving our services and user experience{'\n'}
            • Sending relevant notifications and updates{'\n'}
            • Ensuring security and preventing fraud
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Information Sharing
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We do not sell, trade, or rent your personal information to third parties. We may share information with:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Restaurants and delivery partners to fulfill orders{'\n'}
            • Payment processors for secure transactions{'\n'}
            • Service providers who assist in app operations{'\n'}
            • Legal authorities when required by law
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Data Security
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Your Rights
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            You have the right to:
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            • Access and update your personal information{'\n'}
            • Request deletion of your account and data{'\n'}
            • Opt-out of marketing communications{'\n'}
            • Control location permissions{'\n'}
            • Request data portability
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            If you have any questions about this Privacy Policy, please contact us at {contactEmail}
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