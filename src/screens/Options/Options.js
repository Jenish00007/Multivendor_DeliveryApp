import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  StatusBar,
  FlatList,
  usecurrentTheme,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserContext from '../../context/User';
import { theme } from '../../utils/themeColors'; // Import the theme object
import OptionsStyles from './OptionsStyles';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import RadioButton from '../../ui/FdRadioBtn/RadioBtn';
import i18next from '../../../i18next';
import { useTranslation } from 'react-i18next';
import { useAppBranding } from '../../utils/translationHelper';

// Define languageTypes before using it in state
const languageTypes = [
  { value: 'English (UK)', code: 'en', index: 0, nativeText: 'English', flag: 'https://flagcdn.com/w80/gb.png' },
  { value: 'Egypt (عربي)', code: 'ar', index: 1, nativeText: 'عربي', flag: 'https://flagcdn.com/w80/eg.png' },
  { value: 'India', code: 'hi', index: 2, nativeText: 'हिंदी', flag: 'https://flagcdn.com/w80/in.png' },
  { value: 'Pakistan', code: 'ur', index: 3, nativeText: 'اردو', flag: 'https://flagcdn.com/w80/pk.png' },
  { value: 'Bangladesh', code: 'bn', index: 4, nativeText: 'বাংলাদেশ', flag: 'https://flagcdn.com/w80/bd.png' },
  { value: 'Philippines', code: 'tl', index: 5, nativeText: 'tagalog', flag: 'https://flagcdn.com/w80/ph.png' },
  { value: 'Iran', code: 'fa', index: 6, nativeText: 'فارسی', flag: 'https://flagcdn.com/w80/ir.png' },
  { value: 'Nepal', code: 'ne', index: 7, nativeText: 'नेपाली', flag: 'https://flagcdn.com/w80/np.png' },
  { value: 'Srilanka (sinhala)', code: 'si', index: 8, nativeText: 'සිංහල', flag: 'https://flagcdn.com/w80/lk.png' },
  { value: 'United states (tamil)', code: 'ta', index: 9, nativeText: 'தமிழ்', flag: 'https://flagcdn.com/w80/us.png' }
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { formetedProfileData, logout, isDeliveryMan } = useContext(UserContext);
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation();
  const branding = useAppBranding();

  // Get styles with theme colors
  const styles = OptionsStyles(currentTheme);
  

  const fullName = formetedProfileData ? 
    `${formetedProfileData.name || ''}`.trim() : 
    'Welcome';

  // Language selection state
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [activeRadio, activeRadioSetter] = useState(languageTypes[0].index);
  const [loadinglang, setLoadingLang] = useState(false);

  useEffect(() => {
    selectLanguage();
  }, []);

  async function selectLanguage() {
    const lang = await AsyncStorage.getItem('enatega-language')
    if (lang) {
      const defLang = languageTypes.findIndex((el) => el.code === lang)
      const langName = languageTypes[defLang].value
      activeRadioSetter(defLang)
      setSelectedLanguage(langName)
    }
  }

  async function onSelectedLanguage(selectedIndex) {
    try {
      setLoadingLang(true)
      await AsyncStorage.setItem(
        'enatega-language',
        languageTypes[selectedIndex].code
      )

      const lang = languageTypes[selectedIndex].code
      const langName = languageTypes[selectedIndex].value
      
      setSelectedLanguage(langName)
      activeRadioSetter(selectedIndex)
      await i18next.changeLanguage(lang)
      setLanguageModalVisible(false)
    } catch (error) {
      console.error('Error during language selection:', error)
    } finally {
      setLoadingLang(false)
    }
  }

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length > 10) {
      // For international numbers, just add + prefix
      return `+${cleaned}`;
    }
    
    return phone; // Return original if no formatting applies
  };

  // Handle logout
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      
        <StatusBar 
          backgroundColor={branding.primaryColor} 
          barStyle="dark-content"
        />
        
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Profile Section */}
        <View style={[styles.profile, { backgroundColor: currentTheme.itemCardColor }]}>
          <TouchableOpacity 
            style={styles.profileCenter}
            onPress={() => navigation.navigate("Profile")}>
            <View style={styles.profileAvatarWrapper}>
              <Image
                alt="Profile"
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                }}
                style={[styles.profileAvatar, { borderColor: branding.primaryColor }]} />

              <View style={[styles.profileAction, { backgroundColor: branding.primaryColor, borderColor: currentTheme.itemCardColor }]}>
                <FeatherIcon color="#fff" name="edit-3" size={15} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: currentTheme.fontMainColor }]}>{fullName}</Text>
            <Text style={[styles.profileRole, { color: currentTheme.fontSecondColor }]}>Customer</Text>
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.fontSecondColor }]}>General</Text>

          <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="mail" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Email</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                {formetedProfileData?.email || 'Add email'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="phone" size={20} />
            </View>

            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Phone Number</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                {formetedProfileData?.phone || formetedProfileData?.phoneNumber ? 
                  formatPhoneNumber(formetedProfileData.phone || formetedProfileData.phoneNumber) : 
                  'Add phone number'}
              </Text>
            </View>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Addresses")}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="map-pin" size={20} />
            </View>

            <View style={styles.detailContainer} > 
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Address</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                {formetedProfileData?.address || 'Add address'}
              </Text>
            </View>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section 
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.fontSecondColor }]}>Preferences</Text>

          {/* <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="globe" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Language</Text>

            <View style={styles.rowSpacer} />
            
            <Text style={[styles.rowValueInline, { color: currentTheme.fontSecondColor }]}>{selectedLanguage}</Text>

            <FeatherIcon
              color={currentTheme.fontSecondColor}
              name="chevron-right"
              size={20} />
          </TouchableOpacity> */}

          {/* <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="moon" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Dark Mode</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={darkMode => setForm({ ...form, darkMode })}
              value={form.darkMode} />
          </View> */}

          {/* <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="at-sign" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Email Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={emailNotifications =>
                setForm({ ...form, emailNotifications })
              }
              value={form.emailNotifications} />
          </View> */}

          {/* <View style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: currentTheme.primary }]}>
              <FeatherIcon color="#fff" name="bell" size={20} />
            </View>

            <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Push Notifications</Text>

            <View style={styles.rowSpacer} />

            <Switch
              trackColor={{ false: "#e0e0e0", true: currentTheme.primary }}
              thumbColor={"#fff"}
              onValueChange={pushNotifications =>
                setForm({ ...form, pushNotifications })
              }
              value={form.pushNotifications} />
          </View> 
        </View>
        */}
        
        {/* Help & Support Section with updated content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.fontSecondColor }]}>Help & Support</Text>

         

          {/* Terms & Conditions with content */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('TermsAndConditions')}
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="file-text" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Terms & Conditions</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                View our terms of service
              </Text>
            </View>
            <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
          </TouchableOpacity>

          {/* Privacy Policy with content */}
          {!isDeliveryMan && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('PrivacyPolicy')}
              style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
              <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
                <FeatherIcon color="#fff" name="shield" size={20} />
              </View>
              <View style={styles.detailContainer}>
                <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Privacy Policy</Text>
                <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                  Learn how we protect your data
                </Text>
              </View>
              <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
            </TouchableOpacity>
          )}

          {/* Refund Policy */}
          {!isDeliveryMan && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('RefundPolicy')}
              style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
              <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
                <FeatherIcon color="#fff" name="refresh-cw" size={20} />
              </View>
              <View style={styles.detailContainer}>
                <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Refund Policy</Text>
                <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                  View our refund policy
                </Text>
              </View>
              <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
            </TouchableOpacity>
          )}

          {/* Cancellation Policy */}
          {!isDeliveryMan && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('CancellationPolicy')}
              style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
              <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
                <FeatherIcon color="#fff" name="x-circle" size={20} />
              </View>
              <View style={styles.detailContainer}>
                <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Cancellation Policy</Text>
                <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                  View our cancellation policy
                </Text>
              </View>
              <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
            </TouchableOpacity>
          )}

          {/* Shipping Policy */}
          {!isDeliveryMan && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('ShippingPolicy')}
              style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}>
              <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
                <FeatherIcon color="#fff" name="truck" size={20} />
              </View>
              <View style={styles.detailContainer}>
                <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Shipping Policy</Text>
                <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                  View our shipping policy
                </Text>
              </View>
              <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}
            onPress={() => navigation.navigate('Help')}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="help-circle" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>Help & Support</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                Get help with your orders and questions
              </Text>
            </View>
            <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: currentTheme.itemCardColor }]}
            onPress={() => navigation.navigate('About')}>
            <View style={[styles.rowIcon, { backgroundColor: branding.primaryColor }]}>
              <FeatherIcon color="#fff" name="info" size={20} />
            </View>
            <View style={styles.detailContainer}>
              <Text style={[styles.rowLabel, { color: currentTheme.fontMainColor }]}>About Us</Text>
              <Text style={[styles.rowValue, { color: currentTheme.fontSecondColor }]}>
                Learn about our mission and values
              </Text>
            </View>
            <FeatherIcon color={currentTheme.fontSecondColor} name="chevron-right" size={20} />
          </TouchableOpacity>
          
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.accountActionButton, 
            styles.logoutButton,
            { backgroundColor: currentTheme === 'dark' ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)' }
          ]} 
          onPress={handleLogout}
        >
          <FeatherIcon name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        isVisible={languageModalVisible}
        onBackdropPress={() => setLanguageModalVisible(false)}
        onBackButtonPress={() => setLanguageModalVisible(false)}
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.itemCardColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setLanguageModalVisible(false)}
              style={styles.backButton}
            >
              <FeatherIcon name="chevron-left" size={24} color={currentTheme.fontMainColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: currentTheme.fontMainColor }]}>
              Language
            </Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
            {languageTypes.map((item, index) => {
              // Validate flag URI
              const flagUri = typeof item?.flag === 'string' && item.flag.trim() ? item.flag : null;
              
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={index}
                  onPress={() => onSelectedLanguage(item.index)}
                  style={[styles.languageItem, activeRadio === item.index && styles.selectedLanguageItem]}
                >
                  <View style={styles.languageItemLeft}>
                    {flagUri ? (
                      <Image 
                        source={{ uri: flagUri }} 
                        style={styles.flagIcon} 
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.flagIcon} />
                    )}
                  <View style={styles.languageTexts}>
                    <Text style={[styles.languageText, { color: currentTheme.fontMainColor }]}>
                      {item.value}
                    </Text>
                    <Text style={[styles.nativeText, { color: currentTheme.fontSecondColor }]}>
                      {item.nativeText}
                    </Text>
                  </View>
                </View>
                {activeRadio === item.index && (
                  <View style={styles.checkmarkContainer}>
                    <FeatherIcon name="check" size={24} color="#007AFF" />
                  </View>
                )}
              </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {loadinglang && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={currentTheme.tagColor} />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Update styles to improve spacing and alignment
const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  
  detailContainer: {
    flex: 1,
    marginRight: 8,
  },
  
  rowValue: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },

  // Updated and new modal styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingBottom: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedLanguageItem: {
    backgroundColor: '#F8F8F8',
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
  },
  languageTexts: {
    flex: 1,
  },
  languageText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 4,
  },
  nativeText: {
    fontSize: 15,
    opacity: 0.7,
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});