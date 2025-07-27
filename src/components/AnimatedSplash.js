import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Animated } from 'react-native';
import { Text } from 'react-native';
import { StatusBar } from 'react-native';
import { useConfiguration } from '../context/Configuration';
import { useAppBranding } from '../utils/translationHelper';

const { width, height } = Dimensions.get('window');

const AnimatedSplash = ({ onAnimationComplete }) => {
  const configuration = useConfiguration();
  const branding = useAppBranding();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const messageTranslateY = useRef(new Animated.Value(50)).current;

  // Get app name from branding or configuration
  const appName = branding.appName || configuration?.config?.appName || 'Delivery Partner';

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Message animation
      Animated.parallel([
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(messageTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, []);

  const logoStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  const messageStyle = {
    opacity: messageOpacity,
    transform: [{ translateY: messageTranslateY }],
  };

  return (
    <View style={[styles.container, { backgroundColor: branding.primaryColor }]}>
      <StatusBar
        backgroundColor={branding.primaryColor}
        barStyle="light-content"
        translucent
      />
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={branding.splashLogo || branding.logo}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.messageContainer, messageStyle]}>
        <Text style={[styles.welcomeText, { color: branding.whiteColorText }]}>
          Welcome to {appName}
        </Text>
        <Text style={[styles.tagline, { color: branding.whiteColorText }]}>
          Your trusted delivery partner
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: width * 0.5,
    height: width * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  messageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default AnimatedSplash; 