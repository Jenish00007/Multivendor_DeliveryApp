import React, { useContext, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  StatusBar
} from "react-native";
import { Feather } from "@expo/vector-icons";  
import UserContext from "../../context/User";
import AuthContext from "../../context/Auth";
import { theme } from '../../utils/themeColors'; // Import the theme object
import { useAppBranding } from '../../utils/translationHelper';

const ProfilePage = () => {
  const { formetedProfileData } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userData, setUserDataLocal] = useState({ ...formetedProfileData });
  const branding = useAppBranding();
  
  // Get the current color scheme (system preference)
  const colorScheme = useColorScheme();
  
  // Use the Dark theme if system preference is dark, otherwise use Pink theme
  const currentTheme = colorScheme === 'dark' ? theme.Dark : theme.Pink;

  // Update userData when formetedProfileData changes
  useEffect(() => {
    if (formetedProfileData) {
      // Handle both user types - regular users have 'phone', delivery men have 'phoneNumber'
      const profileData = { ...formetedProfileData };
      if (profileData.phoneNumber && !profileData.phone) {
        profileData.phone = profileData.phoneNumber;
      }
      setUserDataLocal(profileData);
    }
  }, [formetedProfileData]);

  const handleChange = (field, value) => {
    setUserDataLocal((prev) => ({ ...prev, [field]: value }));
  };

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

  // Clean phone number for API submission
  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const updateProfile = async () => {
    if (!token) {
      Alert.alert("Error", "Authentication token is missing. Please log in.");
      return;
    }
  
    setLoading(true);
    try {
      // Determine if user is delivery man by checking if phoneNumber field exists
      const isDeliveryMan = formetedProfileData?.phoneNumber !== undefined;
      
      const endpoint = isDeliveryMan 
        ? "https://6ammart-admin.6amtech.com/api/v1/deliveryman/update-profile"
        : "https://6ammart-admin.6amtech.com/api/v1/customer/update-profile";
      
      const requestBody = isDeliveryMan 
        ? {
            name: userData.name || userData.f_name,
            email: userData.email,
            phoneNumber: cleanPhoneNumber(userData.phone),
            address: userData.address,
          }
        : {
            name: userData.f_name,
            email: userData.email,
            phone: cleanPhoneNumber(userData.phone),
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-localization": "en",
          "moduleId": "1",
          "zoneId": JSON.stringify([3, 1]),
          "latitude": "23.793544663762145",
          "longitude": "90.41166342794895",
        },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
      console.log("API Response:", result);
  
      if (response.ok) {
        Alert.alert(
          "Success", 
          "Profile updated successfully!"
        );
      } else {
        throw new Error(result.errors?.[0]?.message || "Profile update failed.");
      }
    } catch (error) {
      console.log("Update Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}
    >
      <StatusBar
        backgroundColor={branding.primaryColor}
        barStyle="dark-content"
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={[styles.profileCard, { backgroundColor: currentTheme.itemCardColor }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.fontSecondColor }]}>First Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.color8, 
                  color: currentTheme.fontMainColor,
                  borderColor: currentTheme.borderColor 
                }]}
                value={userData.f_name}
                onChangeText={(text) => handleChange("f_name", text)}
                placeholderTextColor={currentTheme.fontSecondColor}
                placeholder="Enter your first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.fontSecondColor }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.color8, 
                  color: currentTheme.fontMainColor,
                  borderColor: currentTheme.borderColor 
                }]}
                value={userData.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholderTextColor={currentTheme.fontSecondColor}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.fontSecondColor }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: currentTheme.color8, 
                  color: currentTheme.fontMainColor,
                  borderColor: currentTheme.borderColor 
                }]}
                value={userData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholderTextColor={currentTheme.fontSecondColor}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                maxLength={15}
              />
              {userData.phone && (
                <Text style={[styles.phoneFormat, { color: currentTheme.fontSecondColor }]}>
                  Formatted: {formatPhoneNumber(userData.phone)}
                </Text>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: currentTheme.primary }]}>Security</Text>
              <View style={[styles.divider, { backgroundColor: currentTheme.borderBottomColor }]} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: currentTheme.fontSecondColor }]}>Password</Text>
              <View style={[styles.passwordField, { 
                backgroundColor: currentTheme.color8, 
                borderColor: currentTheme.borderColor 
              }]}>
                <Text style={[styles.passwordDots, { color: currentTheme.fontMainColor }]}>••••••••</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: currentTheme.buttonBackground }]} 
        onPress={updateProfile} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={currentTheme.buttonText} />
        ) : (
          <Text style={[styles.saveButtonText, { color: currentTheme.buttonText }]}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  phoneFormat: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  passwordField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  passwordDots: {
    fontSize: 16,
  },
  saveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ProfilePage;