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

export default function PrivacyPolicy() {
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar backgroundColor="#F16122" barStyle="dark-content" />
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
            At Qauds, we collect various types of information to provide and improve our service:
            • Personal Information (name, email, phone number)
            • Location Data
            • Device Information
            • Transaction History
            • Usage Data
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We use the collected information for:
            • Processing your orders
            • Providing customer support
            • Sending important updates
            • Improving our services
            • Personalizing your experience
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            3. Data Security
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            4. Third-Party Services
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We may employ third-party companies and individuals to facilitate our service, provide service-related services, or assist us in analyzing how our service is used.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            5. Your Rights
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            You have the right to:
            • Access your personal data
            • Correct inaccurate data
            • Request deletion of your data
            • Object to data processing
            • Data portability
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            6. Changes to This Policy
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
            7. Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: currentTheme.fontSecondColor }]}>
            If you have any questions about this Privacy Policy, please contact us at privacy@Qauds.com
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