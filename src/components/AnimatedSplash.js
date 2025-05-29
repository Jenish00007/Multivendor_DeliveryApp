import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Text } from 'react-native';
import { theme } from '../utils/themeColors';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedSplash = ({ onAnimationComplete }) => {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const messageTranslateY = useSharedValue(50);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const messageStyle = useAnimatedStyle(() => {
    return {
      opacity: messageOpacity.value,
      transform: [{ translateY: messageTranslateY.value }],
    };
  });

  useEffect(() => {
    // Logo animation
    logoScale.value = withSpring(1, { damping: 10 });
    logoOpacity.value = withSpring(1);

    // Message animation
    messageOpacity.value = withDelay(800, withSpring(1));
    messageTranslateY.value = withDelay(800, withSpring(0));

    // Complete animation after 2.5 seconds
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#F16122"
        barStyle="dark-content"
        translucent
      />
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.messageContainer, messageStyle]}>
        <Text style={styles.welcomeText}>Welcome to Qauds</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F16122', 
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
    color: '#000000',
    fontSize: 24,
    fontWeight: '300',
    marginBottom: 5,
  },
  appName: {
    color: '#000000',
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 10,
  },
  tagline: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
});

export default AnimatedSplash; 