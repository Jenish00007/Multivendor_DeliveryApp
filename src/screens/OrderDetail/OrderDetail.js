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

const { height: HEIGHT, width: WIDTH } = Dimensions.get('screen')

function OrderDetail(props) {
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
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

  console.log('response', props)
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
      
      const headers = {
        'moduleId': '1',
        'zoneId': '[1]',
        'latitude': '23.79354466376145',
        'longitude': '90.41166342794895',
        'Authorization': token ? `Bearer ${token}` : ''
      }

      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/order/track?order_id=${id}`, {
        method: 'GET',
        headers: headers,
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `API returned status ${response.status}`)
      }

      if (!data) {
        throw new Error('No data received from API')
      }

      // Handle both single order and orders array responses
      const orderData = data.id ? data : (data.orders && data.orders[0])
      
      if (!orderData) {
        throw new Error('Order not found or invalid response format')
      }

      setOrder(orderData)

    } catch (err) {
      console.error('Error fetching order:', err)
      setError(err.message || 'Failed to fetch order details')
      Alert.alert(
        'Error',
        `Failed to load order details: ${err.message}`,
        [{ text: 'OK' }]
      )
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
        'moduleId': '1',
        'zoneId': '[1]',
        'latitude': '23.79354466376145',
        'longitude': '90.41166342794895',
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }

      // Create form data
      const formBody = []
      formBody.push(`_method=put`)
      formBody.push(`order_id=${id}`)
      formBody.push(`reason=${encodeURIComponent(reason)}`)

      const response = await fetch('https://6ammart-admin.6amtech.com/api/v1/customer/order/cancel', {
        method: 'POST',
        headers: headers,
        body: formBody.join('&')
      })

      if (!response || !response.ok) {
        const errorData = await response?.json().catch(() => ({}))
        throw new Error(errorData?.message || 'Failed to cancel order')
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Failed to cancel order')
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
    if (order) {
      props.navigation.setOptions({
        headerRight: () => HelpButton({ iconBackground: currentTheme.buttonBackground, navigation, t }),
        headerTitle: t('orderDetails'),
        headerTitleStyle: { 
          color: currentTheme.buttonTextPink,
          fontSize: scale(18),
          fontWeight: '600'
        },
        headerStyle: { 
          backgroundColor: currentTheme.buttonBackground,
          elevation: 0,
          shadowOpacity: 0
        },
        headerTintColor: currentTheme.buttonTextPink,
        headerTitleAlign: 'center'
      })
    }
  }, [order])

  if (loading || !order) {
    return (
      <Spinner
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    )
  }
  if (error) return <TextError text={error} />

  const remainingTime = calulateRemainingTime(order)
  const {
    id: orderId,
    store,
    delivery_address,
    order_amount,
    delivery_charge,
    total_tax_amount,
    dm_tips,
    store_discount_amount,
    order_status
  } = order

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor={currentTheme.buttonBackground}
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: currentTheme.themeBackground,
          paddingBottom: scale(150)
        }}
        showsVerticalScrollIndicator={false}
        overScrollMode='never'
      >
        {order.delivery_man && order_status === 'picked_up' && (
          <MapView
            ref={(c) => (mapView.current = c)}
            style={{ flex: 1, height: HEIGHT * 0.4 }}
            showsUserLocation={false}
            initialRegion={{
              latitude: +delivery_address.latitude,
              longitude: +delivery_address.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
            zoomEnabled={true}
            zoomControlEnabled={true}
            rotateEnabled={false}
            customMapStyle={mapStyle}
            provider={PROVIDER_GOOGLE}
          >
            <Marker
              coordinate={{
                longitude: +store.longitude,
                latitude: +store.latitude
              }}
            >
              <RestaurantMarker />
            </Marker>
            <Marker
              coordinate={{
                latitude: +delivery_address.latitude,
                longitude: +delivery_address.longitude
              }}
            >
              <CustomerMarker />
            </Marker>
            <MapViewDirections
              origin={{
                longitude: +store.longitude,
                latitude: +store.latitude
              }}
              destination={{
                latitude: +delivery_address.latitude,
                longitude: +delivery_address.longitude
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
          <OrderStatusImage status={order_status} />
          {order_status !== 'delivered' && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: scale(10)
              }}
            >
              {!['pending', 'cancelled'].includes(order_status) && (
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
                    item={order}
                    navigation={navigation}
                  />
                </>
              )}
              <TextDefault
                H5
                style={{ marginTop: scale(10), textAlign: 'center' }}
                textColor={currentTheme.gray600}
                bold
              >
                {t(order_status?.toUpperCase() || 'PENDING')}
              </TextDefault>
            </View>
          )}
        </View>
        <Instructions title={'Instructions'} theme={currentTheme} message={order.delivery_instruction} />
        <Detail
          navigation={props.navigation}
          currencySymbol="₹"
          items={[]} // You'll need to add items data from your API
          from={store?.name || ''}
          orderNo={orderId?.toString() || ''}
          deliveryAddress={delivery_address?.address || ''}
          subTotal={order_amount - total_tax_amount - delivery_charge - dm_tips + store_discount_amount}
          tip={dm_tips}
          tax={total_tax_amount}
          deliveryCharges={delivery_charge}
          total={order_amount}
          theme={currentTheme}
          id={orderId}
          rider={order.delivery_man}
          orderStatus={order_status}
        />
      </ScrollView>
      <View style={styles().bottomContainer(currentTheme)}>
        <PriceRow
          theme={currentTheme}
          title={t('total')}
          currency="₹"
          price={order_amount.toFixed(2)}
        />
        {order_status === 'pending' && (
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
      <CancelModal
        theme={currentTheme}
        modalVisible={cancelModalVisible}
        setModalVisible={() => setCancelModalVisible(false)}
        cancelOrder={handleCancelOrder}
        loading={cancelling}
        orderStatus={order_status}
        orderId={id}
      />
    </View>
  )
}

export const OrderStatusImage = ({ status }) => {
  let imagePath = null;
  switch (status) {
    case 'pending':
      imagePath = require('../../assets/SVG/order-placed.json')
      break
    case 'accepted':
      imagePath = require('../../assets/SVG/order-tracking-preparing.json')
      break
    case 'processing':
      imagePath = require('../../assets/SVG/food-picked.json')
      break
    case 'picked_up':
      imagePath = require('../../assets/SVG/place-order.json')
      break
    case 'delivered':
      imagePath = require('../../assets/SVG/place-order.json')
      break
  }

  if (!imagePath) return null

  return <LottieView
    style={{
      width: 150,
      height: 150
    }}
    source={imagePath}
    autoPlay
    loop
  />
}

export default OrderDetail
