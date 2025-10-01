import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Dimensions,
  Text,
  // TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import {
  MaterialIcons,
  Ionicons,
  Entypo,
  AntDesign,
  SimpleLineIcons,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import styles from './styles'
import TextDefault from '../../Text/TextDefault/TextDefault'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { theme } from '../../../utils/themeColors'
import { useNavigation } from '@react-navigation/native'
import { DAYS } from '../../../utils/enums'
import {
  BorderlessButton,
  RectButton,
  TouchableOpacity
} from 'react-native-gesture-handler'
import { scale } from '../../../utils/scaling'
import { alignment } from '../../../utils/alignment'
import TextError from '../../Text/TextError/TextError'
import { textStyles } from '../../../utils/textStyles'
import { useTranslation } from 'react-i18next'
import Search from '../../../components/Main/Search/Search'
import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import Spinner from '../../Spinner/Spinner'
import UserContext from '../../../context/User'
import { addFavouriteRestaurant } from '../../../apollo/mutations'
import { profile } from '../../../apollo/queries'
import { calculateDistance } from '../../../utils/customFunctions'
import { LocationContext } from '../../../context/Location'
import ConfigurationContext from '../../../context/Configuration'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle
} from 'react-native-reanimated'
import AddToFavourites from '../../Favourites/AddtoFavourites'

const AnimatedText = Animated.createAnimatedComponent(Text)
const AnimatedBorderless = Animated.createAnimatedComponent(BorderlessButton)
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const { height } = Dimensions.get('screen')
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT = height * 0.4
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const ADD_FAVOURITE = gql`
  ${addFavouriteRestaurant}
`
const PROFILE = gql`
  ${profile}
`

function ImageTextCenterHeader(props, ref) {
  const { translationY } = props
  const flatListRef = ref
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location } = useContext(LocationContext)
  const { t } = useTranslation()
  const newheaderColor = currentTheme.backgroundColor
  const cartContainer = currentTheme.gray500
  const { profile } = useContext(UserContext)
  const configuration = useContext(ConfigurationContext)
  const heart = profile ? profile.favourite.includes(props.restaurantId) : false
  const [mutate, { loading: loadingMutation }] = useMutation(ADD_FAVOURITE, {
    onCompleted,
    refetchQueries: [{ query: PROFILE }]
  })

  function onCompleted() {
    FlashMessage({ message: t('favouritelistUpdated') })
  }

  const handleAddToFavorites = () => {
    <AddToFavourites restaurantId={props.restaurantId} />
  }

  
  // Validate restaurant image URI
  const validRestaurantImage = typeof props?.restaurantImage === 'string' && props.restaurantImage.trim() 
    ? props.restaurantImage 
    : null;

  const aboutObject = {
    latitude: props.restaurant ? props.restaurant.latitude : '',
    longitude: props.restaurant ? props.restaurant.longitude : '',
    address: props.restaurant ? props.restaurant.address : '',
    restaurantName: props.restaurantName,
    restaurantImage: validRestaurantImage,
    restaurantTax: props.tax,
    restaurantMinOrder: props.minimumOrder,
    deliveryTime: props.restaurant ? props.restaurant.delivery_time : '...',
    average: props.restaurant ? props.restaurant.rating_count : '...',
    total: props.restaurant ? props.restaurant.avg_rating : '...',
    reviews: props.restaurant ? props.restaurant.reviews : '...',
    isAvailable: props.restaurant ? props.restaurant.isAvailable : true,
    openingTimes: props.restaurant ? props.restaurant.schedules : [],
    isOpen: () => {
      if (!props.restaurant) return true
      const date = new Date()
      const day = date.getDay()
      
      // Find today's schedule
      const todaysTimings = props.restaurant.schedules?.find(
        schedule => schedule.day === day
      )
      
      if (!todaysTimings) return false
      
      const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`
      
      // Check if current time is between opening and closing time
      return currentTime >= todaysTimings.opening_time && currentTime <= todaysTimings.closing_time
    }
  }

  const minutesOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationY.value,
        [0, TOP_BAR_HEIGHT, SCROLL_RANGE / 2],
        [0, 0.8, 1],
        Extrapolation.CLAMP
      )
    }
  })



  const headerHeight = useAnimatedStyle(() => {
    return {
      height: interpolate(
        translationY.value,
        [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        Extrapolation.CLAMP
      )
    }
  })

  const headerHeightWithoutTopbar = useAnimatedStyle(() => {
    return {
      height: interpolate(
        translationY.value,
        [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
        [
          HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT,
          HEADER_MIN_HEIGHT - TOP_BAR_HEIGHT
        ],
        Extrapolation.CLAMP
      )
    }
  })


  const opacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationY.value,
        [0, height * 0.05, SCROLL_RANGE / 2],
        [1, 0.8, 0],
        Extrapolation.CLAMP
      )
    }
  })

  const distance = calculateDistance(
    aboutObject?.latitude,
    aboutObject?.longitude,
    location?.latitude,
    location?.longitude
  )

  const emptyView = () => {
    return (
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <TextError text={t('noItemsExists')} />
      </View>
    )
  }

  return (
    <Animated.View style={[styles(currentTheme).mainContainer, headerHeight]}>
      <Animated.View style={[headerHeightWithoutTopbar]}>
        <Animated.View style={[styles().overlayContainer]}>
          <View style={styles().fixedViewNavigation}>
            <View style={styles().backIcon}>
              {props.searchOpen ? (
                <AnimatedBorderless
                  activeOpacity={0.7}
                  style={[
                    styles().touchArea,
                    {
                      backgroundColor: props.themeBackground,
                      borderRadius: props.iconRadius,
                      height: props.iconTouchHeight
                    }
                  ]}
                  onPress={props.searchPopupHandler}
                >
                  <Entypo
                    name='cross'
                    color={currentTheme.newIconColor}
                    size={scale(22)}
                  />
                </AnimatedBorderless>
              ) : (
                <AnimatedBorderless
                  activeOpacity={0.7}
                  style={[
                    styles().touchArea,
                    {
                      backgroundColor: props.themeBackground,
                      borderRadius: props.iconRadius,
                      height: props.iconTouchHeight
                    }
                  ]}
                  onPress={() => navigation.goBack()}
                >
              
                  <Ionicons
                    name='arrow-back'
                    color={currentTheme.newIconColor}
                    size={scale(22)}
                  />
                </AnimatedBorderless>
              )}
            </View>
            <View style={styles().center}>
              {!props.searchOpen && (
                <AnimatedText
                  numberOfLines={1}
                  style={[styles(currentTheme).headerTitle, minutesOpacity]}
                >
                  {t('delivery')} {aboutObject.deliveryTime} {t('Min')}
                </AnimatedText>
              )}
            </View>
            <View style={styles().fixedIcons}>
              {props.searchOpen ? (
                <>
                  <Search
                    setSearch={props.setSearch}
                    search={props.search}
                    newheaderColor={newheaderColor}
                    cartContainer={cartContainer}
                    placeHolder={t('searchItems')}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles().touchArea,
                      {
                        backgroundColor: props.themeBackground,
                        borderRadius: props.iconRadius,
                        height: props.iconTouchHeight
                      }
                    ]}
                    onPress={handleAddToFavorites}
                  >
                    {/* <View>
                      {loadingMutation ? (
                        <Spinner
                          size={'small'}
                          backColor={'transparent'}
                          spinnerColor={currentTheme.iconColorDark}
                        />
                      ) : (
                        <AntDesign
                          name={heart ? 'heart' : 'hearto'}
                          size={scale(15)}
                          color={currentTheme.newIconColor}
                        />
                      )}
                    </View> */}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles(currentTheme).touchArea,
                      {
                        backgroundColor: props.themeBackground,
                        borderRadius: props.iconRadius,
                        height: props.iconTouchHeight
                      }
                    ]}
                    onPress={props.searchHandler}
                  >
                    <Ionicons
                      name='search-outline'
                      style={{
                        fontSize: props.iconSize
                      }}
                      color={currentTheme.newIconColor}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          {!props.search && !props.loading && (
            <Animated.View style={[styles().restaurantDetails, opacity]}>
              <Animated.View
                style={[
                  {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: scale(15),
                    marginBottom: scale(20)
                  }
                ]}
              >
                <View style={[styles().restImageContainer]}>
                  {aboutObject.restaurantImage ? (
                    <Image
                      resizeMode='cover'
                      source={{ uri: aboutObject.restaurantImage }}
                      style={[styles().restaurantImg]}
                    />
                  ) : (
                    <View style={[styles().restaurantImg]} />
                  )}
                </View>
                <View style={[styles().restaurantTitle, { flex: 1 }]}>
                  <TextDefault
                    H4
                    bolder
                    textColor={currentTheme.fontMainColor}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {aboutObject.restaurantName}
                  </TextDefault>
                   {/* Add the AddtoFavourites component here */}
        
                  {/* Store Status and Rating Row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: scale(4), justifyContent: 'space-between' }}>
                    {/* Open/Closed Status */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: props.restaurant?.open ? currentTheme.success : currentTheme.error,
                      paddingHorizontal: scale(8),
                      paddingVertical: scale(2),
                      borderRadius: scale(12),
                    }}>
                      <MaterialCommunityIcons 
                        name="clock-outline"
                        size={scale(14)}
                        color={currentTheme.white}
                      />
                      <TextDefault
                        style={{ marginLeft: scale(4) }}
                        textColor={currentTheme.white}
                        small
                      >
                        {props.restaurant?.open ? t('Open') : t('Closed')} 
                      </TextDefault>
                      <TextDefault
                        style={{ marginLeft: scale(4) }}
                        textColor={currentTheme.white}
                        small
                      >
                        {props.restaurant?.delivery_time}
                      </TextDefault>
                    </View>

                    {/* Rating Badge */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: currentTheme.secondaryBackground,
                      paddingHorizontal: scale(8),
                      paddingVertical: scale(2),
                      borderRadius: scale(12),
                    }}>
                      <MaterialIcons
                        name="star"
                        size={scale(14)}
                        color={currentTheme.yellow}
                      />
                      <TextDefault
                        textColor={currentTheme.fontMainColor}
                        style={{ marginLeft: scale(4) }}
                        small
                      >
                        {props.restaurant?.avg_rating} ({props.restaurant?.rating_count})
                      </TextDefault>
                    </View>
                  </View>
                </View>
              </Animated.View>

              <View style={{ display: 'flex', flexDirection: 'row', gap: 7 }}>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  {distance.toFixed(2)}km {t('away')}
                </TextDefault>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  |
                </TextDefault>
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  ₹{' '}{aboutObject.restaurantMinOrder} {t('minimum')}
                </TextDefault>
              </View>

              {/* Store Contact Info */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(5) }}>
                  <MaterialIcons
                    name="phone"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={styles().restaurantAbout}
                    textColor={currentTheme.fontMainColor}
                  >
                    {props.restaurant?.phone}
                  </TextDefault>
                </View>
              </View>

              {/* Store Address */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: scale(5) }}>
                  <MaterialIcons
                    name="location-on"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={[styles().restaurantAbout, { flex: 1 }]}
                    textColor={currentTheme.fontMainColor}
                    numberOfLines={2}
                  >
                    {aboutObject.address}
                  </TextDefault>
                </View>
              </View>

              {/* Store Features */}
              <View style={{ marginTop: scale(8), flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) }}>
                {props.restaurant?.delivery && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }}>
                    <MaterialCommunityIcons
                      name="truck-delivery"
                      size={scale(18)}
                      color={currentTheme.fontMainColor}
                    />
                    <TextDefault
                      style={styles().restaurantAbout}
                      textColor={currentTheme.fontMainColor}
                    >
                      {t('Delivery Available')}
                    </TextDefault>
                  </View>
                )}
                
                {props.restaurant?.take_away && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(4) }}>
                    <MaterialCommunityIcons
                      name="shopping"
                      size={scale(18)}
                      color={currentTheme.fontMainColor}
                    />
                    <TextDefault
                      style={styles().restaurantAbout}
                      textColor={currentTheme.fontMainColor}
                    >
                      {t('Takeaway Available')}
                    </TextDefault>
                  </View>
                )}
              </View>

              {/* Store Hours */}
              <View style={{ marginTop: scale(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(5) }}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={scale(18)}
                    color={currentTheme.fontMainColor}
                  />
                  <TextDefault
                    style={styles().restaurantAbout}
                    textColor={currentTheme.fontMainColor}
                  >
                    {props.restaurant?.open ? 'Open' : 'Closed'} ({props.restaurant?.delivery_time})
                  </TextDefault>
                </View>
              </View>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 7,
                  marginTop: scale(10)
                }}
              >
                <TextDefault
                  style={styles().restaurantAbout}
                  textColor={currentTheme.fontMainColor}
                >
                  {props.restaurant?.delivery ? t('Delivery Available') : ''} 
                  {props.restaurant?.delivery && props.restaurant?.take_away ? ' | ' : ''}
                  {props.restaurant?.take_away ? t('Takeaway Available') : ''}
                </TextDefault>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>

      {!props.search && (
        <>
          {!props.loading && (
           
            <FlatList
              ref={props.flatListRef}
              style={styles(currentTheme).flatListStyle}
              contentContainerStyle={{ flexGrow: 1 }}
              data={props.loading ? [] : props.topaBarData}
              horizontal={true}
              ListEmptyComponent={emptyView()}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View
                  style={
                    props.selectedLabel === index
                      ? styles(currentTheme).activeHeader
                      : null
                  }
                >
                  <RectButton
                    rippleColor={currentTheme.rippleColor}
                    onPress={() => {
                      // Pass item.id to the parent component
                      if (props.onItemPress) {
                        props.onItemPress(item.id); // Assuming onItemPress is passed from parent
                        // console.log(item.id)
                      }
                      props.changeIndex(index); // Keep the existing functionality
                    }}
                    style={styles(currentTheme).headerContainer}
                  >
                    <View style={styles().navbarTextContainer}>
                      <TextDefault
                        style={
                          props.selectedLabel === index
                            ? textStyles.Bolder
                            : textStyles.H5
                        }
                        textColor={
                          props.selectedLabel === index
                            ? currentTheme.fontFourthColor
                            : currentTheme.gray500
                        }
                        center
                        H5
                      >
                        {item.name}
                      </TextDefault>
                    </View>
                  </RectButton>
                </View>
              )}
            />
          )}
        </>
      )}
    </Animated.View>
  )
}

export default React.forwardRef(ImageTextCenterHeader)
