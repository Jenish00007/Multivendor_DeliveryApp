/* eslint-disable react/display-name */
import React, {
  useRef,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback
} from 'react'
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Text,
  RefreshControl, FlatList
} from 'react-native'
import {
  MaterialIcons,
  SimpleLineIcons,
  AntDesign,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import { useQuery, useMutation } from '@apollo/client'
import {
  useCollapsibleSubHeader,
  CollapsibleSubHeaderAnimator
} from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import gql from 'graphql-tag'
import { useLocation } from '../../ui/hooks'
import Search from '../../components/Main/Search/Search'
import UserContext from '../../context/User'
import { LocationContext } from '../../context/Location'
import { getCuisines, restaurantListPreview } from '../../apollo/queries'
import { selectAddress } from '../../apollo/mutations'
import { scale } from '../../utils/scaling'
import styles from './styles'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import navigationOptions from '../Main/navigationOptions'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import analytics from '../../utils/analytics'
import { useTranslation } from 'react-i18next'
import Filters from '../../components/Filter/FilterSlider'
import { FILTER_TYPE } from '../../utils/enums'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import Spinner from '../../components/Spinner/Spinner'
import MainModalize from '../../components/Main/Modalize/MainModalize'
import { escapeRegExp } from '../../utils/regex'
import CarouselSlider from '../../components/Slider/Slider'
import Categories from '../../components/Categories/Categories'
import BottomTab from '../../components/BottomTab/BottomTab'
import OfferCard from '../../components/OfferCard/OfferCard'
import Products from '../../components/Products/Products'
import CategoryListView from '../../components/NearByShop/CategoryListView'
import NewFiggoStore from '../../components/NewFiggoStore/NewFiggoStore'
import axios from 'axios'
import { API_URL } from '../../config/api'


const RESTAURANTS = gql`
  ${restaurantListPreview}
`
const SELECT_ADDRESS = gql`
  ${selectAddress}
`

const GET_CUISINES = gql`
  ${getCuisines}
`

export const FILTER_VALUES = {
  Sort: {
    type: FILTER_TYPE.RADIO,
    values: ['Relevance (Default)', 'Fast Delivery', 'Distance'],
    selected: []
  },
  Offers: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['Free Delivery', 'Accept Vouchers', 'Deal']
  },
  Rating: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: ['3+ Rating', '4+ Rating', '5 star Rating']
  }
}

function Menu() {

  const Analytics = analytics()
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    popular: { type: 'checkbox', values: ['Option 1', 'Option 2'], selected: [] },
    latest: { type: 'radio', values: ['Option A', 'Option B'], selected: [] },
    topOffer: { type: 'checkbox', values: ['Offer 1', 'Offer 2'], selected: [] },
  });
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [restaurantData, setRestaurantData] = useState([])
  const [sectionData, setSectionData] = useState([])
  const modalRef = useRef(null)
  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { getCurrentLocation } = useLocation()
  const locationData = location
  const [localZoneId, setLocalZoneId] = useState('[1]')
  const [recommendedItem, setRecommendedItem] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [nearbymarkets, setNearbymarkets] = useState([]);
  const [nearbymarketsOffer, setNearbymarketsOffer] = useState([]);
  const [popularItem, setPopularItem] = useState([]);
  const [specialItem, setSpecialItem] = useState([]);
  const [allStores, setAllStore] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [zoneId, setZoneId] = useState('[1]')
  const [flashSaleItem, setFlashSaleItem] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [moduleId, setModuleId] = useState('1');
  const [allproducts, setAllproducts] = useState([]);
  const [latestItem, setLatestItem] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
      
  const { data, refetch, networkStatus, loading, error } = useQuery(
    RESTAURANTS,
    {
      variables: {
        longitude: location.longitude || null,
        latitude: location.latitude || null,
        shopType: selectedType || null,
        ip: null
      },
      onCompleted: data => {
        setRestaurantData(data.nearByRestaurantsPreview.restaurants)
        setSectionData(data.nearByRestaurantsPreview.sections)
      },
      fetchPolicy: 'network-only'
    }
  )
  const [mutate, { loading: mutationLoading }] = useMutation(SELECT_ADDRESS, {
    onError
  })

  const { data: allCuisines } = useQuery(GET_CUISINES)

  const newheaderColor = currentTheme.newheaderColor

  const {
    onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */,
    translateY
  } = useCollapsibleSubHeader()

  //Search Placeholder Text Changes
  const searchPlaceholderText =
    selectedType === 'restaurant' ? t('searchRestaurant') : t('Search Products')
  const menuPageHeading =
    selectedType === 'restaurant' ? t('allRestaurant') : t('allGrocery')
  const emptyViewDesc =
    selectedType === 'restaurant' ? t('noRestaurant') : t('noGrocery')


    // useEffect(() => {
    //   if (location) {
    //     const getZoneId = async () => {
    //       try {
    //         const response = await axios.get(`https://6ammart-admin.6amtech.com/api/v1/config/get-zone-id?lat=${location.latitude}&lng=${location.longitude}`)
    //         if (response.data && response.data.zone_id) {
    //           setLocalZoneId(response.data.zone_id)
    //         }
    //       } catch (error) {
    //         console.error('Error fetching zone ID:', error)
    //       }
    //     }
    //     getZoneId()
    //   }
    // }, [location])

  //Theme setup android and ios
  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(currentTheme.newheaderColor)
    }
    StatusBar.setBarStyle('dark-content')
  })

  //Track Analytics
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_MAIN)
    }
    Track()
  }, [])

  //Model open
  const onOpen = () => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }


  //App Layout Theme 
  useLayoutEffect(() => {
    navigation.setOptions(
      navigationOptions({
        headerMenuBackground: currentTheme.main,
        horizontalLine: currentTheme.headerColor,
        fontMainColor: currentTheme.darkBgFont,
        iconColorPink: currentTheme.black,
        open: onOpen,
        icon: 'back'
      })
    )
  }, [navigation, currentTheme])

  function onError(error) {
    console.log(error)
  }

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  const setAddressLocation = async address => {
    setLocation({
      _id: address._id,
      label: address.label,
      latitude: Number(address.location.coordinates[1]),
      longitude: Number(address.location.coordinates[0]),
      deliveryAddress: address.deliveryAddress,
      details: address.details
    })
    mutate({ variables: { id: address._id } })
    modalRef.current.close()
  }

  //Location Fetch
  const setCurrentLocation = async () => {
    setBusy(true)
    const { error, coords } = await getCurrentLocation()

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.log('Reverse geocoding request failed:', data.error)
        } else {
          let address = data.display_name
          if (address.length > 21) {
            address = address.substring(0, 21) + '...'
          }

          if (error) navigation.navigate('SelectLocation')
          else {
            modalRef.current.close()
            setLocation({
              label: 'currentLocation',
              latitude: coords.latitude,
              longitude: coords.longitude,
              deliveryAddress: address
            })
            setBusy(false)
          }
          // console.log(address)
        }
      })
      .catch(error => {
        console.error('Error fetching reverse geocoding data:', error)
      })
  }

  // Add loading states
  const [bannersLoading, setBannersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [supermarketsLoading, setSupermarketsLoading] = useState(true);
  const [nearbyMarketsLoading, setNearbyMarketsLoading] = useState(true);
  const [nearbyMarketsOfferLoading, setNearbyMarketsOfferLoading] = useState(true);
  const [popularItemLoading, setPopularItemLoading] = useState(true);
  const [allStoresLoading, setAllStoresLoading] = useState(true);
  const [flashSaleItemLoading, setFlashSaleItemLoading] = useState(true);
  const [recommendedItemLoading, setRecommendedItemLoading] = useState(true);
  // Add loading placeholder component
  const ListLoadingComponent = ({ horizontal = true, count = 3, type = 'store' }) => {
    // Define sizes based on type
    const sizes = {
      banner: { width: '100%', height: scale(150) },
      category: { width: scale(80), height: scale(80) },
      store: { width: scale(150), height: scale(180) },
      nearbyStore: { width: scale(200), height: scale(120) },
      offer: { width: scale(200), height: scale(120) },
      product: { width: scale(130), height: scale(160) },
      allStore: { width: '100%', height: scale(120) }
    };

    const currentSize = sizes[type];

    return (
      <View style={{ 
        flexDirection: horizontal ? 'row' : 'column',
        paddingHorizontal: scale(12)
      }}>
        {[...Array(count)].map((_, index) => (
          <View
            key={index}
            style={{
              marginRight: horizontal ? scale(10) : 0,
              marginBottom: !horizontal ? scale(10) : 0,
              backgroundColor: currentTheme.placeHolderColor,
              borderRadius: 8,
              width: currentSize.width,
              height: currentSize.height,
              overflow: 'hidden'
            }}>
            <Placeholder
              Animation={props => (
                <Fade
                  {...props}
                  style={{ backgroundColor: currentTheme.placeHolderColor }}
                  duration={500}
                  iterationCount={1}
                />
              )}>
              <PlaceholderLine 
                style={{ 
                  height: type === 'nearbyStore' ? '70%' : '60%', 
                  marginBottom: 0,
                  opacity: 0.7
                }} 
              />
              <View style={{ padding: 8 }}>
                <PlaceholderLine 
                  width={80} 
                  style={{ opacity: 0.5 }}
                />
                {type !== 'category' && (
                  <PlaceholderLine 
                    width={50} 
                    style={{ opacity: 0.3 }}
                  />
                )}
              </View>
            </Placeholder>
          </View>
        ))}
      </View>
    );
  };

  // Update banner fetch
  useEffect(() => {
    const fetchBanners = async () => {
      setBannersLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin-banner/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': zoneId,
            'moduleId': moduleId
          }
        });
        const json = await response.json();
        if (json?.banners && json.banners.length > 0) {
          setBanners(json.banners);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };
    fetchBanners();
  }, [moduleId, zoneId]);

  // Update categories fetch
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await fetch(`${API_URL}/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': zoneId,
            'moduleId': moduleId
          }
        });
        const json = await response.json();
      
        if (json?.data?.length > 0) {
          setCategories(json?.data);
         
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [moduleId, zoneId]);

  // Update supermarkets fetch
  useEffect(() => {
    const fetchSupermarkets = async () => {
      setSupermarketsLoading(true);
      try {
        const response = await fetch('https://6ammart-admin.6amtech.com/api/v1/stores/latest?type=all', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': zoneId,
            'moduleId': moduleId
          }
        });
        const json = await response.json();
        if (json?.stores && json.stores.length > 0) {
          setSupermarkets(json.stores);
        }
      } catch (error) {
        console.error('Error fetching supermarkets:', error);
      } finally {
        setSupermarketsLoading(false);
      }
    };
    fetchSupermarkets();
  }, [moduleId, zoneId]);

  // Update nearby markets fetch
  useEffect(() => {
    const fetchAllproducts = async () => {
      setNearbyMarketsLoading(true);
      try {
        const response = await fetch(`${API_URL}/product/get-all-products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            
          }
        });
        const json = await response.json();
       // console.log(json);
        if (json?.products && json?.products.length > 0) {
          setAllproducts(json?.products);
        }
      } catch (error) {
        console.error('Error fetching nearby markets:', error);
      } finally {
        setNearbyMarketsLoading(false);
      }
    };
    fetchAllproducts();
  }, [moduleId, zoneId]);
  
  // Update nearby markets fetch
  useEffect(() => {
    const fetchAlllatest = async () => {
      setNearbyMarketsLoading(true);
      try {
        const response = await fetch(`${API_URL}/user-products/latest`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            
          }
        });
        const json = await response.json();
       // console.log(json);
        if (json?.products && json?.products.length > 0) {
          setLatestItem(json?.products);
        }
      } catch (error) {
        console.error('Error fetching nearby markets:', error);
      } finally {
        setNearbyMarketsLoading(false);
      }
    };
    fetchAlllatest();
  }, [moduleId, zoneId]);

  // Update nearby markets offer fetch
  useEffect(() => {
    const fetchNearbymarketsOffer = async () => {
      setNearbyMarketsOfferLoading(true);
      try {
        const response = await fetch('https://6ammart-admin.6amtech.com/api/v1/stores/top-offer-near-me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'zoneId': zoneId,
            'moduleId': moduleId
          }
        });
        const json = await response.json();
        if (json?.stores && json.stores.length > 0) {
          setNearbymarketsOffer(json.stores);
        }
      } catch (error) {
        console.error('Error fetching nearby market offers:', error);
      } finally {
        setNearbyMarketsOfferLoading(false);
      }
    };
    fetchNearbymarketsOffer();
  }, [moduleId, zoneId]);

  // Update popular items fetch
  useEffect(() => {
    const fetchPopularItem = async () => {
      setPopularItemLoading(true);
      try {
        const response = await fetch(`${API_URL}/user-products/popular`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const json = await response.json();
        if (json?.products && Array.isArray(json.products)) {
          // Filter out any invalid products
          const validProducts = json.products.filter(product => 
            product && 
            typeof product === 'object' && 
            product._id
          );
          setPopularItem(validProducts);
        } else {
          setPopularItem([]);
          console.log('No valid products found in response');
        }
      } catch (error) {
        console.error('Error fetching popular items:', error);
        setPopularItem([]);
      } finally {
        setPopularItemLoading(false);
      }
    };
    fetchPopularItem();
  }, [moduleId, zoneId]);

  useEffect(() => {
    const fetchFlashSaleItem = async () => {
      setFlashSaleItemLoading(true);
      try {
        const response = await fetch(`${API_URL}/user-products/flash-sale`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const json = await response?.json();
        if (json?.products && Array.isArray(json.products)) {
          // Filter out any invalid products
          const validProducts = json.products.filter(product => 
            product && 
            typeof product === 'object' && 
            product._id
          );
          setFlashSaleItem(validProducts);
        } else {
          setFlashSaleItem([]);
          console.log('No valid products found in response');
        }
      } catch (error) {
        console.error('Error fetching flash sale items:', error);
        setFlashSaleItem([]);
      } finally {
        setFlashSaleItemLoading(false);
      }
    };
    fetchFlashSaleItem();
  }, [moduleId, zoneId]);

  useEffect(() => {
    const fetchRecommendedItem = async () => {
      setRecommendedItemLoading(true);
      try {
        const response = await fetch(`${API_URL}/user-products/recommended`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const json = await response?.json();
        if (json?.products && Array.isArray(json.products)) {
          // Filter out any invalid products
          const validProducts = json.products.filter(product => 
            product && 
            typeof product === 'object' && 
            product._id
          );
          setRecommendedItem(validProducts);
        } else {
          setRecommendedItem([]);
          console.log('No valid products found in response');
        }
      } catch (error) {
        console.error('Error fetching recommended items:', error);
        setRecommendedItem([]);
      } finally {
        setRecommendedItemLoading(false);
      }
    };
    fetchRecommendedItem();
  }, []);

  // Update fetchData
  const fetchData = async (category) => {
    setAllStoresLoading(true);
    let url = '';
    switch (category) {
      case 'popular':
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/popular?type=all';
        break;
      case 'latest':
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/latest?type=all';
        break;
      case 'top-offer':
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/top-offer-near-me';
        break;
      default:
        url = 'https://6ammart-admin.6amtech.com/api/v1/stores/get-stores/all?store_type=all';
        break;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'zoneId': zoneId,
          'moduleId': moduleId
        }
      });
      const data = await response.json();
      if (data?.stores && Array.isArray(data.stores)) {
        // Filter out any invalid stores
        const validStores = data.stores.filter(store => 
          store && 
          typeof store === 'object' && 
          store._id
        );
        setAllStore(validStores);
      } else {
        setAllStore([]);
        console.log('No valid stores found in response');
      }
    } catch (error) {
      console.error("Error fetching stores data:", error);
      setAllStore([]);
    } finally {
      setAllStoresLoading(false);
    }
  };

  const applyFilters = (filter) => {
    setSelectedFilter(filter);

    // Trigger the corresponding API call based on filter
    switch (filter) {
      case 'popular':
        fetchData('popular');
        break;
      case 'latest':
        fetchData('latest');
        break;
      case 'top-offer':
        fetchData('top-offer');
        break;
      default:
        fetchData('all');
        break;
    }
  };

  useEffect(() => {
    fetchData('all');
  }, []);

  // Header
  const modalHeader = () => (
    <View style={[styles().addNewAddressbtn]}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          style={[styles(currentTheme).addButton]}
          activeOpacity={0.7}
          onPress={setCurrentLocation}
          disabled={busy}
        >
          <View style={styles().addressSubContainer}>
            {
              busy ? <Spinner size='small' /> : (
                <>
                  <SimpleLineIcons name="target" size={scale(18)} color={currentTheme.black} />
                  <View style={styles().mL5p} />
                  <TextDefault bold>{t('currentLocation')}</TextDefault>
                </>
              )
            }
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )

  //App not Available in YourArea
  const emptyView = () => {
    return (
      <View style={styles().emptyViewContainer}>
        <View style={styles(currentTheme).emptyViewBox}>
          <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
            {t('notAvailableinYourArea')}
          </TextDefault>
          <TextDefault textColor={currentTheme.fontMainColor} center>
            {emptyViewDesc}
          </TextDefault>
        </View>
      </View>
    )
  }

  //Footer Modal
  const modalFooter = () => (
    <View style={styles().addNewAddressbtn}>
      <View style={styles(currentTheme).addressContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles(currentTheme).addButton}
          onPress={() => {
            if (isLoggedIn) {
              navigation.navigate('AddNewAddress', { ...locationData })
            } else {
              const modal = modalRef.current
              modal?.close()
              navigation.navigate({ name: 'CreateAccount' })
            }
          }}>
          <View style={styles().addressSubContainer}>
            <AntDesign
              name="pluscircleo"
              size={scale(20)}
              color={currentTheme.black}
            />
            <View style={styles().mL5p} />
            <TextDefault bold>{t('addAddress')}</TextDefault>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles().addressTick}></View>
    </View>
  )
  // console.log(filters);

  // Add debounced search function
  const debouncedSearch = useCallback((searchTerm) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const response = await fetch(
          `${API_URL}/search/products?keyword=${encodeURIComponent(searchTerm.trim())}&sortBy=name&sortOrder=asc&page=1&limit=10`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const json = await response.json()
        if (json?.success && Array.isArray(json?.products)) {
          setSearchResults(json.products)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 500) // 500ms debounce delay
  }, [])

  // Update search handler
  const handleSearch = useCallback((text) => {
    setSearch(text)
    debouncedSearch(text)
  }, [debouncedSearch])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        style={[styles().flex, { backgroundColor: 'black' }]}>
        <View style={[styles().flex, styles(currentTheme).screenBackground]}>
          <View style={styles().flex}>
            <View style={styles().mainContentContainer}>
              <View style={[styles().flex, styles().subContainer]}>
                {/* Search Bar Section */}
                <View style={styles(currentTheme).searchbar}>
                  <Search
                    setSearch={handleSearch}
                    search={search}
                    newheaderColor={newheaderColor}
                    placeHolder={searchPlaceholderText}
                  />
                </View>

                {search ? (
                  <View style={styles().searchList}>
                    <Animated.FlatList
                      contentInset={{
                        top: containerPaddingTop
                      }}
                      contentContainerStyle={{
                        paddingTop: Platform.OS === 'ios' ? 0 : containerPaddingTop,
                        paddingHorizontal: scale(12)
                      }}
                      contentOffset={{
                        y: -containerPaddingTop
                      }}
                      onScroll={onScroll}
                      scrollIndicatorInsets={{
                        top: scrollIndicatorInsetTop
                      }}
                      showsVerticalScrollIndicator={false}
                      ListEmptyComponent={
                        searchLoading ? (
                          <View style={{ padding: 20, alignItems: 'center' }}>
                            <Spinner size='small' />
                          </View>
                        ) : (
                          <View style={{ 
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                            minHeight: 200
                          }}>
                            <Text style={{
                              fontSize: 16,
                              color: currentTheme.fontSecondColor,
                              textAlign: 'center'
                            }}>No products found</Text>
                          </View>
                        )
                      }
                      keyExtractor={(item) => item._id.toString()}
                      refreshControl={
                        <RefreshControl
                          progressViewOffset={containerPaddingTop}
                          colors={[currentTheme.iconColorPink]}
                          refreshing={searchLoading}
                          onRefresh={() => debouncedSearch(search)}
                        />
                      }
                      data={searchResults}
                      renderItem={({ item }) => <Products item={item} />}
                      ItemSeparatorComponent={() => <View style={{ height: scale(8) }} />}
                    />
                  </View>
                ) : (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}>
                    {/* Banners Section */}
                    <View style={{ padding: 10 }}>
                      {bannersLoading ? (
                        <ListLoadingComponent horizontal={false} count={1} type="banner" />
                      ) : banners.length > 0 ? (
                        <CarouselSlider banners={banners} />
                      ) : null}
                    </View>

                    {/* Categories Section */}
                    <TextDefault style={styles().sectionTitle}>Categories</TextDefault>
                    {categoriesLoading ? (
                      <ListLoadingComponent count={4} type="category" />
                    ) : (
                      <Categories categories={categories} />
                    )}

                    {/* Nearby Stores Section */}
                    <TextDefault style={styles().sectionTitle}>Recommended Items</TextDefault>
                    {recommendedItemLoading ? (
                      <ListLoadingComponent count={3} type="product" />
                    ) : (
                      <FlatList
                        data={popularItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <CategoryListView data={{ item, index }} />
                        )}
                        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
                      />
                    )}

                    {/* Top Offers Section */}
                    <TextDefault style={styles().sectionTitle}>Top Offers 🔥</TextDefault>
                    {nearbyMarketsOfferLoading ? (
                      <ListLoadingComponent count={3} type="offer" />
                    ) : (
                      <FlatList
                        data={popularItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <OfferCard item={item} />
                        )}
                        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
                      />
                    )}

                    {/* Popular Items Section */}
                    <TextDefault style={styles().sectionTitle}>Most Popular Items 🔥</TextDefault>
                    {popularItemLoading ? (
                      <ListLoadingComponent count={3} type="product" />
                    ) : (
                      <FlatList
                        data={popularItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <Products item={item} horizontal={true} />
                        )}
                        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
                      />
                    )}

                    {/* New on Qauds Section */}
                    <TextDefault style={styles().sectionTitle}>New on Qauds</TextDefault>
                    {nearbyMarketsLoading ? (
                      <ListLoadingComponent count={3} type="nearbyStore" />
                    ) : (
                      <FlatList
                        data={latestItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <CategoryListView data={{ item, index }} />
                        )}
                        keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
                      />
                    )}

                    {/* Filters Section */}
                    {/* <Filters
                      filters={filters}
                      setFilters={setFilters}
                      applyFilters={applyFilters}
                    /> */}
                      <TextDefault style={styles().sectionTitle}>All Items 🔥</TextDefault>
                    {/* All Stores Section */}
                    {allStoresLoading ? (
                      <View style={{ paddingHorizontal: scale(12) }}>
                        <ListLoadingComponent horizontal={false} count={3} type="allStore" />
                      </View>
                    ) : (
                      <FlatList
                      key={`products-grid`}
                      data={allproducts}
                      numColumns={2}
                      showsVerticalScrollIndicator={false}
                      columnWrapperStyle={{ 
                        justifyContent: 'space-between',
                        paddingHorizontal: 10,
                        marginBottom: 10
                      }}
                      contentContainerStyle={{ 
                        padding: 10,
                        paddingBottom: 20,
                        flexGrow: 1
                      }}
                      renderItem={({ item }) => (
                        <View style={{ 
                          width: '55%',
                          marginBottom: 10
                        }}>
                          <Products
                            item={item}
                            horizontal={false}
                          />
                        </View>
                      )}
                      keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
                      ListEmptyComponent={
                        <View style={{ 
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 20,
                          minHeight: 200
                        }}>
                          <Text style={{
                            fontSize: 16,
                            color: currentTheme.fontSecondColor,
                            textAlign: 'center'
                          }}>No products found</Text>
                        </View>
                      }
                    />
                      
                    )}
                  </ScrollView>
                )}
              </View>
            </View>
          </View>

          {/* Modal */}
          <MainModalize
            modalRef={modalRef}
            currentTheme={currentTheme}
            isLoggedIn={isLoggedIn}
            addressIcons={addressIcons}
            modalHeader={modalHeader}
            modalFooter={modalFooter}
            setAddressLocation={setAddressLocation}
            profile={profile}
            location={location}
          />
        </View>
      </SafeAreaView>
      <BottomTab screen="HOME" />
    </>
  )
}

export default Menu
