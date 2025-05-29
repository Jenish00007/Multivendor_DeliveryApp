import React, { useContext, useState } from "react";
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

const ProfilePage = () => {
  const { formetedProfileData } = useContext(UserContext);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [userData, setUserDataLocal] = useState({ ...formetedProfileData });
  
  // Get the current color scheme (system preference)
  const colorScheme = useColorScheme();
  
  // Use the Dark theme if system preference is dark, otherwise use Pink theme
  const currentTheme = colorScheme === 'dark' ? theme.Dark : theme.Pink;

  const handleChange = (field, value) => {
    setUserDataLocal((prev) => ({ ...prev, [field]: value }));
  };

  const updateProfile = async () => {
    if (!token) {
      Alert.alert("Error", "Authentication token is missing. Please log in.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("https://6ammart-admin.6amtech.com/api/v1/customer/update-profile", {
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
        body: JSON.stringify({
          name: userData.f_name,
          email: userData.email,
          phone: userData.phone,
        }),
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
        backgroundColor="#F16122"
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
                keyboardType="phone-pad"
              />
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
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
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