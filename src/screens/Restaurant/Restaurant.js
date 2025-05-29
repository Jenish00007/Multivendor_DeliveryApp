import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import React, { useState, useContext, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  SectionList, FlatList, StyleSheet, ActivityIndicator
} from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useSharedValue,
  Easing as EasingNode,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  useAnimatedScrollHandler
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import ImageHeader from '../../components/Restaurant/ImageHeader'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'
import { useRestaurant } from '../../ui/hooks'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import { DAYS } from '../../utils/enums'
import { alignment } from '../../utils/alignment'
import TextError from '../../components/Text/TextError/TextError'
import { MaterialIcons } from '@expo/vector-icons'
import analytics from '../../utils/analytics'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { popularItems, food } from '../../apollo/queries'

import { useTranslation } from 'react-i18next'
import ItemCard from '../../components/ItemCards/ItemCards'
import { ScrollView } from 'react-native-gesture-handler'
import { IMAGE_LINK } from '../../utils/constants'
import { LocationContext } from '../../context/Location'
import PopularIcon from '../../assets/SVG/popular'
import { escapeRegExp } from '../../utils/regex'
import AddtoFavourites from './../../components/Favourites/AddtoFavourites'
import AuthContext from '../../context/Auth'

const { height } = Dimensions.get('screen')

// Animated Section List component
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT = height * 0.4
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
const HALF_HEADER_SCROLL = HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT

const POPULAR_ITEMS = gql`
  ${popularItems}
`
const FOOD = gql`
  ${food}
`

// const concat = (...args) => args.join('')
function Restaurant(props) {
  const { _id: restaurantId } = props.route.params
  const Analytics = analytics()
  const { t } = useTranslation()
  const scrollRef = useRef(null)
  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const route = useRoute()
  const propsData = route.params
  const animation = useSharedValue(0)
  const translationY = useSharedValue(0)
  const circle = useSharedValue(0)
  const themeContext = useContext(ThemeContext)
  const { addToCart, isLoggedIn, restaurant: restaurantCart, setCartRestaurant, cartCount, addQuantity, clearCart, checkItemCart } = useContext(UserContext);
  const { location } = useContext(LocationContext);
  const { token } = useContext(AuthContext);
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const [selectedLabel, selectedLabelSetter] = useState(0)
  const [buttonClicked, buttonClickedSetter] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [storeDetailsByAll, setStoreDetailsByAll] = useState([])
  const [storeDetailsById, setStoreDetailsById] = useState([])
  const [loadingItemId, setLoadingItemId] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const moduleId = propsData.module_id


  const { data, refetch, networkStatus, loading, error } = useRestaurant(
    propsData._id
  )

  const client = useApolloClient()
  const { data: popularItems } = useQuery(POPULAR_ITEMS, {
    variables: { restaurantId }
  })

  const fetchFoodDetails = (itemId) => {
    return client.readFragment({ id: `Food:${itemId}`, fragment: FOOD })
  }

  const dataList =
    popularItems &&
    popularItems?.popularItems?.map((item) => {
      const foodDetails = fetchFoodDetails(item.id)
      return foodDetails
    })

  const searchHandler = () => {
    setSearchOpen(!searchOpen)
    setShowSearchResults(!showSearchResults)
  }

  const searchPopupHandler = () => {
    setSearchOpen(!searchOpen)
    setSearch('')
    translationY.value = 0
  }


  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF')
    }
    StatusBar.setBarStyle('dark-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_RESTAURANTS)
    }
    Track()
  }, [])

  const zIndexAnimation = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(
        translationY.value,
        [0, TOP_BAR_HEIGHT, SCROLL_RANGE / 2],
        [-1, 1, 99],
        Extrapolation.CLAMP
      )
    }
  })

  const isOpen = () => {
    if (storeDetailsByAll) {
      if (storeDetailsByAll?.current_opening_time?.length < 1) return false
      const date = new Date()
      const day = date.getDay()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const todaysTimings = storeDetailsByAll?.current_opening_time?.find(
        (o) => o.day === DAYS[day]
      )
      if (todaysTimings === undefined) return false
      const times = todaysTimings.times.filter(
        (t) =>
          hours >= Number(t.startTime[0]) &&
          minutes >= Number(t.startTime[1]) &&
          hours <= Number(t.endTime[0]) &&
          minutes <= Number(t.endTime[1])
      )
      return times?.length > 0
    } else {
      return false
    }
  }



  function wrapContentAfterWords(content, numWords) {
    const words = content.split(' ')
    const wrappedContent = []

    for (let i = 0; i < words.length; i += numWords) {
      wrappedContent.push(words.slice(i, i + numWords).join(' '))
    }

    return wrappedContent.join('\n')
  }



  function tagCart(itemId) {
    if (checkItemCart) {
      const cartValue = checkItemCart(itemId)
      if (cartValue.exist) {
        return (
          <>
            <View style={styles(currentTheme).triangleCorner} />
            <TextDefault
              style={styles(currentTheme).tagText}
              numberOfLines={1}
              textColor={currentTheme.fontWhite}
              bold
              small
              center
            >
              {cartValue.quantity}
            </TextDefault>
          </>
        )
      }
    }
    return null
  }

  const scaleValue = useSharedValue(1)

  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }))

  // button animation
  function animate() {
    scaleValue.value = withRepeat(withTiming(1.5, { duration: 250 }), 2, true)
  }
  const config = (to) => ({
    duration: 250,
    toValue: to,
    easing: EasingNode.inOut(EasingNode.ease)
  })

  const scrollToSection = (index) => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollToLocation({
        animated: true,
        sectionIndex: index,
        itemIndex: 0,
        viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
        viewPosition: 0
      })
    }
  }

  const onScrollEndSnapToEdge = (event) => {
    event.persist()
    const y = event.nativeEvent.contentOffset.y

    if (y > 0 && y < HALF_HEADER_SCROLL / 2) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(0), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
              viewPosition: 0
            })
          }
        })
      }
    } else if (HALF_HEADER_SCROLL / 2 <= y && y < HALF_HEADER_SCROLL) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(SCROLL_RANGE), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
              viewPosition: 0
            })
          }
        })
      }
    }
    buttonClickedSetter(false)
  }
  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y
  })

  function changeIndex(index) {
    if (selectedLabel !== index) {
      selectedLabelSetter(index)
      buttonClickedSetter(true)
      scrollToSection(index)
      scrollToNavbar(index)
    }
  }
  function scrollToNavbar(value = 0) {
    if (flatListRef.current != null) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: value,
        viewPosition: 0.5
      })
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    buttonClickedSetter(false)
    if (viewableItems.length === 0) return
    if (
      selectedLabel !== viewableItems[0].section.index &&
      buttonClicked === false
    ) {
      selectedLabelSetter(viewableItems[0].section.index)
      scrollToNavbar(viewableItems[0].section.index)
    }
  }

  const iconColor = currentTheme.white
  const iconBackColor = currentTheme.white
  const iconRadius = scale(15)
  const iconSize = scale(20)
  const iconTouchHeight = scale(30)
  const iconTouchWidth = scale(30)




  // const handleItemPress = (ShopcategoriId) => {
  //   setShopcategoriId(ShopcategoriId)
  //   fetchStoreDetailsById()
  // };


  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        // First fetch store details to get categories
        const storeResponse = await fetch(`https://6ammart-admin.6amtech.com/api/v1/stores/details/${propsData.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': '[1]',
            'moduleId': moduleId
          }
        });
        const storeJson = await storeResponse.json();
        setStoreDetailsByAll(storeJson.category_details);

        // Get first category ID and fetch its products
        if (storeJson.category_details && storeJson.category_details.length > 0) {
          const firstCategoryId = storeJson.category_details[0].id;
          
          // Fetch products of first category
          const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/items/latest?store_id=${propsData.id}&category_id=${firstCategoryId}&offset=1&limit=13&type=all`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'zoneId': '[1]',
              'moduleId': moduleId
            }
          });
          const json = await response.json();

          if (json?.products && Array.isArray(json.products)) {
            const validProducts = json.products.filter(product => 
              product && typeof product.price !== 'undefined'
            );
            setStoreDetailsById(validProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setStoreDetailsById([]);
      }
    };

    fetchInitialProducts();
  }, [moduleId, propsData.id]);

  const handleItemPress = async (ShopcategoriId) => {
    try {
      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/items/latest?store_id=${propsData.id}&category_id=${ShopcategoriId}&offset=1&limit=13&type=all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'zoneId': '[1]',
          'moduleId': moduleId
        }
      });
      const json = await response.json();

      // Check if products exist and have valid data
      if (json?.products && Array.isArray(json.products)) {
        // Filter out any products that don't have a valid price
        const validProducts = json.products.filter(product => 
          product && typeof product.price !== 'undefined'
        );
        setStoreDetailsById(validProducts);
      } else {
        console.log('No valid products found in response');
        setStoreDetailsById([]);
      }
    } catch (error) {
      console.error('Error fetching fetchStoreDetailsById:', error);
      setStoreDetailsById([]);
    }
  };



  useEffect(() => {
    const fetchStoreDetailsByAll = async () => {
      try {
        const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/stores/details/${propsData.id}`, {
          method: 'GET', // GET request method
          headers: {
            'Content-Type': 'application/json', // Ensures the server knows we're sending JSON
            'zoneId': '[1]', // Pass zoneId in the headers
            'moduleId': moduleId
          }
        });

        const json = await response.json();
        // console.log(json)

        setStoreDetailsByAll(json.category_details);



      } catch (error) {
        console.error('Error fetching fetchStoreDetailsByAll:', error);
      }
    };

    fetchStoreDetailsByAll();
  }, [moduleId]);
  // Code that processes the dummy data
  

  const handleAddToCart = async (item) => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock
    if (item?.stock <= 0) {
      Alert.alert(
        '',
        'Restaurant Closed at the moment',
        [
          {
            text: 'Go back to restaurants',
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
      return;
    }

    setLoadingItemId(item.id);
    try {
      const result = await addToCart(item);
      if (result.success) {
        Alert.alert("Success", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "An error occurred while adding to cart.");
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <>
      <SafeAreaView style={styles(currentTheme).flex}>
        <Animated.View style={styles(currentTheme).flex}>
          <ImageHeader
            ref={flatListRef}
            iconColor={iconColor}
            iconSize={iconSize}
            onItemPress={handleItemPress}
            iconBackColor={iconBackColor}
            iconRadius={iconRadius}
            iconTouchWidth={iconTouchWidth}
            iconTouchHeight={iconTouchHeight}
            restaurantName={propsData?.name ?? data?.restaurant?.name}
            restaurantId={propsData.id}
            restaurantImage={propsData?.logo_full_url ?? data?.restaurant?.logo_full_url}
            restaurant={propsData}
            topaBarData={storeDetailsByAll}
            changeIndex={changeIndex}
            selectedLabel={selectedLabel}
            minimumOrder={propsData?.minimum_order ?? data?.restaurant?.minimum_order}
            tax={propsData?.tax ?? data?.restaurant?.tax}
            searchOpen={searchOpen}
            showSearchResults={showSearchResults}
            setSearch={setSearch}
            search={search}
            searchHandler={searchHandler}
            searchPopupHandler={searchPopupHandler}
            translationY={translationY}
          />

         

          {showSearchResults || searchOpen ? (
            <ScrollView
              style={{
                flexGrow: 1,
                marginTop: TOP_BAR_HEIGHT,
                backgroundColor: currentTheme.themeBackground,
              }}
            >
              {storeDetailsById.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles(currentTheme).searchDealSection}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <View style={styles(currentTheme).deal}>
                        {item?.image ? (
                          <Image
                            style={{
                              height: scale(60),
                              width: scale(60),
                              borderRadius: 30
                            }}
                            source={{ uri: item.image }}
                          />
                        ) : null}
                        <View style={styles(currentTheme).flex}>
                          <View style={styles(currentTheme).dealDescription}>
                            <TextDefault
                              textColor={currentTheme.fontMainColor}
                              style={styles(currentTheme).headerText}
                              numberOfLines={1}
                              bolder
                            >
                              {item.title}
                            </TextDefault>
                            <TextDefault
                              style={styles(currentTheme).priceText}
                              small
                            >
                              {wrapContentAfterWords(item.description, 5)}
                            </TextDefault>
                            <View style={styles(currentTheme).dealPrice}>
                              <TextDefault
                                numberOfLines={1}
                                textColor={currentTheme.fontMainColor}
                                style={styles(currentTheme).priceText}
                                bolder
                                small
                              >
                                ₹{' '}
                                {parseFloat(item.variations[0].price).toFixed(2)}
                              </TextDefault>
                              {item?.variations[0]?.discounted > 0 && (
                                <TextDefault
                                  numberOfLines={1}
                                  textColor={currentTheme.fontSecondColor}
                                  style={styles().priceText}
                                  small
                                  lineOver
                                >
                                  ₹{' '}
                                  {(item.variations[0].price + item.variations[0].discounted).toFixed(2)}
                                </TextDefault>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles().addToCart, { backgroundColor: '#F16122' }]}
                        onPress={() => handleAddToCart(item)}
                        disabled={loadingItemId === item.id}
                      >
                        {loadingItemId === item.id ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <MaterialIcons
                            name="add"
                            size={scale(20)}
                            color="#000000"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {tagCart(item.id)}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : (


            <FlatList
              data={storeDetailsById}
              keyExtractor={(item, index) => String(index)}
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
                marginTop: HEADER_MIN_HEIGHT,
              }}
              renderItem={({ item, index }) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles(currentTheme).searchDealSection}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={styles(currentTheme).deal}>
                        {item?.image_full_url ? (
                          <Image
                            style={{
                              height: scale(60),
                              width: scale(60),
                              borderRadius: 30,
                            }}
                            source={{ uri: item.image_full_url }}
                          />
                        ) : null}
                        <View style={styles(currentTheme).flex}>
                          <View style={styles(currentTheme).dealDescription}>
                            <TextDefault
                              textColor={currentTheme.fontMainColor}
                              style={styles(currentTheme).headerText}
                              numberOfLines={1}
                              bolder
                            >
                              {item.name}
                            </TextDefault>
                            <View style={styles(currentTheme).dealPrice}>
                              <TextDefault
                                numberOfLines={1}
                                textColor={currentTheme.fontMainColor}
                                style={styles(currentTheme).priceText}
                                bolder
                                small
                              >
                                ₹{' '}
                                {parseFloat(item.price).toFixed(2)}
                              </TextDefault>
                              {item?.discount > 0 && (
                                <TextDefault
                                  numberOfLines={1}
                                  textColor={currentTheme.fontSecondColor}
                                  style={styles().priceText}
                                  small
                                  lineOver
                                >
                                  ₹{' '}
                                  {(item.price + item.discount).toFixed(2)}
                                </TextDefault>
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={[styles().addToCart, { backgroundColor: '#F16122' }]}
                        onPress={() => handleAddToCart(item)}
                        disabled={loadingItemId === item.id}
                      >
                        {loadingItemId === item.id ? (
                          <ActivityIndicator size="small" color="#000000" />
                        ) : (
                          <MaterialIcons
                            name="add"
                            size={scale(20)}
                            color="#000000"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {tagCart(item.id)}
                  </TouchableOpacity>
                </View>
              )}
            />


          )}


          {cartCount > 0 && (
            <View style={styles(currentTheme).buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles(currentTheme).button}
                onPress={() => navigation.navigate('Cart')}
              >
                <View style={styles().buttontLeft}>
                  <Animated.View
                    style={[
                      styles(currentTheme).buttonLeftCircle,
                      {
                        width: circleSize,
                        height: circleSize,
                        borderRadius: radiusSize
                      },
                      scaleStyles
                    ]}
                  >
                    <Animated.Text
                      style={[styles(currentTheme).buttonTextLeft, fontStyles]}
                    >
                      {cartCount}
                    </Animated.Text>
                  </Animated.View>
                </View>
                <TextDefault
                  style={styles().buttonText}
                  textColor={currentTheme.buttonTextPink}
                  uppercase
                  center
                  bolder
                  small
                >
                  {t('viewCart')}
                </TextDefault>
                <View style={styles().buttonTextRight} />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </>
  )
}

export default Restaurant