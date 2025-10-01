import React from 'react'
import { ImageBackground } from 'react-native'
import styles from './styles'
import { scale } from '../../../utils/scaling'

function ImageHeader(props) {
  const imageUri = typeof props.image === 'string' && props.image.trim() ? props.image : null;
  
  return (
    <ImageBackground
      style={styles.backgroundImage}
      borderRadius={scale(12)}
      resizeMode="cover"
      source={imageUri ? { uri: imageUri } : require('../../../assets/images/food_placeholder.png')}
      defaultSource={require('../../../assets/images/food_placeholder.png')}
    />
  )
}

export default ImageHeader
