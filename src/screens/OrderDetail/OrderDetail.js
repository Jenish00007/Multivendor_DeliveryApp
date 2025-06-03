import { TouchableOpacity, View, ScrollView, Dimensions, Alert } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import styles from './styles'
import React, { useContext, useEffect, useState, useRef } from 'react'
import Spinner from '../../components/Spinner/Spinner'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import TextError from '../../components/Text/TextError/TextError'
import ConfigurationContext from '../../context/Configuration'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import analytics from '../../utils/analytics'
import Detail from '../../components/OrderDetail/Detail/Detail'
import RestaurantMarker from '../../assets/SVG/restaurant-marker'
import CustomerMarker from '../../assets/SVG/customer-marker'
import TrackingRider from '../../components/OrderDetail/TrackingRider/TrackingRider'
import { mapStyle } from '../../utils/mapStyle'
import { useTranslation } from 'react-i18next'
import { HelpButton } from '../../components/Header/HeaderIcons/HeaderIcons'
import { ProgressBar, checkStatus } from '../../components/Main/ActiveOrders/ProgressBar'
import { useNavigation } from '@react-navigation/native'
import { PriceRow } from '../../components/OrderDetail/PriceRow'
import { ORDER_STATUS_ENUM } from '../../utils/enums'
import { CancelModal } from '../../components/OrderDetail/CancelModal'
import Button from '../../components/Button/Button'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { calulateRemainingTime } from '../../utils/customFunctions'
import { Instructions } from '../../components/Checkout/Instructions'
import MapViewDirections from 'react-native-maps-directions'
import useEnvVars from '../../../environment'
import LottieView from 'lottie-react-native'
import AuthContext from '../../context/Auth'
import { StatusBar } from 'react-native'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { API_URL } from '../../config/api'

const { height: HEIGHT, width: WIDTH } = Dimensions.get('screen')

function OrderDetail(props) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)
  
  const Analytics = analytics()
  const id = props.route.params ? props.route.params.id : null
  const configuration = useContext(ConfigurationContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { GOOGLE_MAPS_KEY } = useEnvVars()
  const mapView = useRef(null)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (id) {
      fetchOrderDetails()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      setOrder(null) // Reset order state before fetching
      
      if (!id) {
        throw new Error('No order ID provided')
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }

      const response = await fetch(
        `${API_URL}/order/get-order/${id}`,
        {
          method: 'GET',
          headers: headers,
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || !data.success || !data.order) {
        throw new Error('No order data received')
      }

      // Format the order data to match our frontend structure
      const formattedOrder = {
        _id: data.order._id || '',
        status: (data.order.status || 'pending').toLowerCase(), // Convert status to lowercase
        totalPrice: data.order.totalPrice || 0,
        createdAt: data.order.createdAt || new Date().toISOString(),
        itemsQty: data.order.itemsQty || 0,
        items: (data.order.items || []).map(item => ({
          _id: item._id || '',
          name: item.name || "Product not found",
          image: item.image || "",
          shopName: item.shopName || "Shop not found"
        })),
        shippingAddress: {
          ...data.order.shippingAddress,
          address: data.order.shippingAddress?.address || '',
          latitude: data.order.shippingAddress?.latitude || 0,
          longitude: data.order.shippingAddress?.longitude || 0
        },
        paymentInfo: {
          status: data.order.paymentInfo?.status || 'pending',
          type: data.order.paymentInfo?.type || 'cash_on_delivery'
        },
        paidAt: data.order.paidAt || null,
        delivery_instruction: data.order.delivery_instruction || '',
        delivery_man: data.order.delivery_man || null,
        store: data.order.store || null
      }

      // Validate the formatted order before setting it
      if (!formattedOrder._id || !formattedOrder.status) {
        throw new Error('Invalid order data received')
      }

      console.log('Formatted Order:', formattedOrder) // Debug log
      setOrder(formattedOrder)

    } catch (err) {
      console.error('Error fetching order:', err)
      let errorMessage = 'Failed to load order details'
      
      if (err.message.includes('Network request failed')) {
        errorMessage = 'Network error: Please check your internet connection'
      } else if (err.message.includes('not authorized')) {
        errorMessage = 'You are not authorized to view this order'
      } else if (err.message.includes('not found')) {
        errorMessage = 'Order not found'
      } else {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_ORDER_DETAIL, {
        orderId: id
      })
    }
    Track()
  }, [])

  const handleCancelOrder = async (reason) => {
    try {
      setCancelling(true)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }

      const response = await fetch(`${API_URL}/orders/order-refund/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ status: 'Cancelled', reason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to cancel order')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to cancel order')
      }

      FlashMessage({
        message: 'Order cancelled successfully'
      })
      
      // Refresh order details
      await fetchOrderDetails()
      
    } catch (error) {
      console.error('Error cancelling order:', error)
      Alert.alert(
        'Error',
        error.message || 'Failed to cancel order. Please try again.'
      )
    } finally {
      setCancelling(false)
      setCancelModalVisible(false)
    }
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: null,
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=""
          backImage={() => (
            <View style={styles().backButton}>
              <MaterialIcons name="arrow-back" size={25} color="#000000" />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      ),
      headerTitle: t('orderDetails'),
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: '#000000',
        fontWeight: 'bold'
      },
      headerTitleContainerStyle: {
        marginTop: '2%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: '#F16122',
        elevation: 0,
        shadowOpacity: 0
      },
      headerTintColor: '#000000'
    })
  }, [navigation, t])

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[styles().container, { backgroundColor: currentTheme.themeBackground }]}>
          <Spinner
            backColor={currentTheme.themeBackground}
            spinnerColor={currentTheme.main}
          />
        </View>
      )
    }

    if (error) {
      return (
        <View style={[styles().container, { backgroundColor: currentTheme.themeBackground }]}>
          <TextError text={error} />
        </View>
      )
    }

    if (!order) {
      return (
        <View style={[styles().container, { backgroundColor: currentTheme.themeBackground }]}>
          <TextDefault>Order not found</TextDefault>
        </View>
      )
    }

    const remainingTime = calulateRemainingTime(order) || 0

    return (
      <>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: currentTheme.themeBackground,
            paddingBottom: scale(150)
          }}
          showsVerticalScrollIndicator={false}
          overScrollMode='never'
        >
          {order?.delivery_man && order?.status === 'picked_up' && order?.shippingAddress && (
            <MapView
              ref={(c) => (mapView.current = c)}
              style={{ flex: 1, height: HEIGHT * 0.4 }}
              showsUserLocation={false}
              initialRegion={{
                latitude: +order?.shippingAddress?.latitude,
                longitude: +order?.shippingAddress?.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}
              zoomEnabled={true}
              zoomControlEnabled={true}
              rotateEnabled={false}
              customMapStyle={mapStyle}
              provider={PROVIDER_GOOGLE}
            >
              {order.store && (
                <Marker
                  coordinate={{
                    longitude: +order?.store?.longitude,
                    latitude: +order?.store?.latitude
                  }}
                >
                  <RestaurantMarker />
                </Marker>
              )}
              {order?.shippingAddress && (
                <Marker
                  coordinate={{
                    latitude: +order?.shippingAddress?.latitude,
                    longitude: +order?.shippingAddress?.longitude
                  }}
                >
                  <CustomerMarker />
                </Marker>
              )}
              {order?.store && order?.shippingAddress && (
                <MapViewDirections
                  origin={{
                    longitude: +order?.store?.longitude,
                    latitude: +order.store.latitude
                  }}
                  destination={{
                    latitude: +order?.shippingAddress?.latitude,
                    longitude: +order?.shippingAddress?.longitude
                  }}
                  apikey={GOOGLE_MAPS_KEY}
                  strokeWidth={6}
                  strokeColor={currentTheme.main}
                  optimizeWaypoints={true}
                  onReady={(result) => {
                    mapView?.current?.fitToCoordinates(result.coordinates, {
                      edgePadding: {
                        right: WIDTH / 20,
                        bottom: HEIGHT / 20,
                        left: WIDTH / 20,
                        top: HEIGHT / 20
                      }
                    })
                  }}
                />
              )}
              {order.delivery_man && <TrackingRider id={order.delivery_man.id} />}
            </MapView>
          )}
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: scale(10),
              paddingBottom: scale(10)
            }}
          >
            <OrderStatusImage status={order?.status} />
            {order?.status !== 'delivered' && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: scale(10)
                }}
              >
                {!['pending', 'cancelled'].includes(order?.status) && (
                  <>
                    <TextDefault
                      style={{ marginBottom: scale(5) }}
                      textColor={currentTheme.gray500}
                      H5
                    >
                      {t('estimatedDeliveryTime')}
                    </TextDefault>
                    <TextDefault
                      style={{ marginBottom: scale(5) }}
                      Regular
                      textColor={currentTheme.gray900}
                      H1
                      bolder
                    >
                      {remainingTime}-{remainingTime + 5} {t('mins')}
                    </TextDefault>
                    <ProgressBar
                      configuration={configuration}
                      currentTheme={currentTheme}
                      orderStatus={order?.status}
                    />
                  </>
                )}
                <TextDefault
                  H5
                  style={{ marginTop: scale(10), textAlign: 'center' }}
                  textColor={currentTheme.gray600}
                  bold
                >
                  {t(order?.status?.toUpperCase() || 'PENDING')}
                </TextDefault>
              </View>
            )}
          </View>
          <Instructions title={'Instructions'} theme={currentTheme} message={order.delivery_instruction} />
          <Detail
            navigation={props.navigation}
            currencySymbol="₹"
            items={order?.items || []}
            from={order?.items?.[0]?.shopName || ''}
            orderNo={order?._id?.toString() || ''}
            deliveryAddress={order?.shippingAddress?.address || ''}
            subTotal={order?.totalPrice || 0}
            tip={0}
            tax={0}
            deliveryCharges={0}
            total={order?.totalPrice || 0}
            theme={currentTheme}
            id={order?._id}
            orderStatus={order?.status}
          />
        </ScrollView>
        <View style={styles().bottomContainer(currentTheme)}>
          <PriceRow
            theme={currentTheme}
            title={t('total')}
            currency="₹"
            price={order.totalPrice?.toFixed(2) || '0.00'}
          />
          {order?.status === 'pending' && (
            <View style={{ margin: scale(20) }}>
              <TouchableOpacity 
                style={[styles().cancelButtonContainer(currentTheme), {
                  backgroundColor: currentTheme.buttonBackground,
                  shadowColor: currentTheme.shadowColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  padding: scale(15),
                  borderRadius: scale(8),
                  alignItems: 'center'
                }]}
                onPress={() => setCancelModalVisible(true)}
              >
                <TextDefault
                  textColor={currentTheme.buttonTextPink}
                  bold
                  style={{ fontSize: scale(16) }}
                >
                  {t('cancelOrder')}
                </TextDefault>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="#F16122"
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />
      {renderContent()}
      <CancelModal
        theme={currentTheme}
        modalVisible={cancelModalVisible}
        setModalVisible={() => setCancelModalVisible(false)}
        cancelOrder={handleCancelOrder}
        loading={cancelling}
        orderStatus={order?.status}
        orderId={id}
      />
    </View>
  )
}

export const OrderStatusImage = ({ status }) => {
  if (!status) {
    return (
      <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="hourglass-empty" size={100} color="#666666" />
      </View>
    )
  }

  const statusLower = status.toLowerCase()
  let imagePath = null;

  switch (statusLower) {
    case 'pending':
      imagePath = require('../../assets/SVG/order-placed.json')
      break
    case 'processing':
      imagePath = require('../../assets/SVG/order-tracking-preparing.json')
      break
    case 'delivered':
      imagePath = require('../../assets/SVG/order-delivered.json')
      break
    case 'cancelled':
      return (
        <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="cancel" size={100} color="#FF0000" />
        </View>
      )
    default:
      return (
        <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name="help-outline" size={100} color="#666666" />
        </View>
      )
  }

  if (!imagePath) {
    return (
      <View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialIcons name="help-outline" size={100} color="#666666" />
      </View>
    )
  }

  return (
    <LottieView
      style={{
        width: 150,
        height: 150
      }}
      source={imagePath}
      autoPlay
      loop
    />
  )
}

export default OrderDetail
