import React from 'react';
import { Image } from 'react-native';
import { useConfiguration } from '../../context/Configuration';

const Logo = ({ style, resizeMode = 'contain', ...props }) => {
  const { logo } = useConfiguration();

  return (
    <Image
      source={{ uri: logo }} 
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

export default Logo; 