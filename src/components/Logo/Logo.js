import React from 'react';
import { Image } from 'react-native';
import { useConfiguration } from '../../context/Configuration';

const Logo = ({ style, resizeMode = 'contain', ...props }) => {
  const { logo } = useConfiguration();

  // Ensure logo is a valid string
  const logoUri = typeof logo === 'string' && logo.trim() ? logo : null;

  return (
    <Image
      source={logoUri ? { uri: logoUri } : require('../../assets/images/logo.png')} 
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

export default Logo; 