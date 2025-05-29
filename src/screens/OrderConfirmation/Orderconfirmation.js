import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Easing
} from 'react-native';
import LottieView from 'lottie-react-native';
import { theme } from '../../utils/themeColors'; // Import the theme object

const OrderConfirmationScreen = ({ navigation }) => {
  // Get the current color scheme (system preference)
  const colorScheme = useColorScheme();
  
  // Use the Dark theme if system preference is dark, otherwise use Pink theme
  const currentTheme = colorScheme === 'dark' ? theme.Dark : theme.Pink;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const checkmarkAnimation = useRef(null);

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // First fade in and scale the success icon
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Then slide up the text and button
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Play the checkmark animation if using Lottie
    if (checkmarkAnimation.current) {
      setTimeout(() => {
        checkmarkAnimation.current.play();
      }, 300);
    }
  }, []);

  const handleGoHome = () => {
    navigation.navigate('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      {/* Floating Confetti Animation */}
      <LottieView
        source={require('../../assets/animations/confetti.json')}
        autoPlay
        loop={false}
        style={styles.confettiAnimation}
        speed={0.7}
      />
      
      {/* Main Content */}
      <View style={styles.confirmationContainer}>
        {/* Success Icon/Animation */}
        <Animated.View
          style={[
            styles.checkIconContainer,
            { 
              backgroundColor: currentTheme.secondaryBackground,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Lottie Animation */}
          <LottieView
            ref={checkmarkAnimation}
            source={require('../../assets/animations/checkmark.json')}
            style={styles.checkmarkLottie}
            loop={false}
          />
        </Animated.View>
        
        {/* Text content with slide-up animation */}
        <Animated.View
          style={{
            alignItems: 'center',
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            width: '100%'
          }}
        >
          <Text style={[styles.title, { color: currentTheme.fontMainColor }]}>
            Order Placed Successfully!
          </Text>
          
          <Text style={[styles.message, { color: currentTheme.fontSecondColor }]}>
            Your order has been placed successfully. We have started our delivery 
            process, and you will receive your item soon.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.buttonBackground }]}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: currentTheme.buttonText }]}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 2,
  },
  checkIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: '#4CAF50',
  },
  checkmarkLottie: {
    width: 185,
    height: 185,
  },
  confettiAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderConfirmationScreen;