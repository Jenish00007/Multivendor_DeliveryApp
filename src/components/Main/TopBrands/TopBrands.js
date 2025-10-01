import React, { useContext } from 'react'
import { View, FlatList, Text, Image } from 'react-native'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useTranslation } from 'react-i18next'
import { LocationContext } from '../../../context/Location'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { topRatedVendorsInfo } from '../../../apollo/queries'
import { useQuery } from '@apollo/client'
import { useNavigation } from '@react-navigation/native'
import TopBrandsLoadingUI from '../LoadingUI/TopBrandsLoadingUI'

function TopBrands(props) {
  const { t } = useTranslation()
  const { location } = useContext(LocationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const navigation = useNavigation()

  const { loading, error, data } = useQuery(topRatedVendorsInfo, {
    variables: {
      latitude: location?.latitude,
      longitude: location?.longitude
    }
  })

  const renderItem = ({ item }) => {
    // Validate image URI
    const imageUri = typeof item?.image === 'string' && item.image.trim() 
      ? item.image 
      : null;
    
    return (
      <TouchableOpacity
        style={styles().topbrandsContainer}
        onPress={() => navigation.navigate('Restaurant', { ...item })}
      >
        <View style={styles().brandImgContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles().brandImg}
              resizeMode='contain'
            />
          ) : (
            <View style={styles().brandImg} />
          )}
        </View>

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <TextDefault
          style={styles().brandName}
          textColor={currentTheme.fontThirdColor}
          H5
          bolder
        >
          {item?.name}
        </TextDefault>
        <TextDefault textColor={currentTheme.fontFifthColor} normal>
          {item?.deliveryTime} + {t('mins')}
        </TextDefault>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) return <TopBrandsLoadingUI />
  if (error) return <Text style={styles().margin}>Error: {error.message}</Text>

  return (
    <View style={styles().topbrandsSec}>
      <TextDefault
        numberOfLines={1}
        textColor={currentTheme.fontFourthColor}
        bolder
        H4
      >
        {t('topBrands')}
      </TextDefault>
      <View style={{ ...alignment.PRsmall }}>
        <FlatList
          data={data?.topRatedVendorsPreview}
          renderItem={renderItem}
          keyExtractor={(item) => item?._id}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
        />
      </View>
    </View>
  )
}

export default TopBrands
