import React, { useState, useEffect } from 'react';
import BottomTab from '../../components/BottomTab/BottomTab';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import axios from 'axios';
import { useAppBranding } from '../../utils/translationHelper';
import useQRPayment from '../../ui/hooks/useQRPayment';
import QRPaymentModal from '../../components/QRPayment/QRPaymentModal';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const branding = useAppBranding();

  // QR Payment Hook
  const {
    qrData,
    paymentStatus,
    loading: qrLoading,
    error: qrError,
    isMonitoring,
    generateQRCode,
    confirmPaymentManually,
    resetQRPayment,
    regenerateQRCode,
    isPaymentSucceeded,
    isPaymentPending,
    setTestQRData,
  } = useQRPayment();

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/order/deliveryman/get-order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const orderData = { 
          ...response.data.order,
          items: response.data.order.items || []
        };
        
        // Debug log to understand address data structure
        console.log('Order Details Address Data:', {
          userLocation: orderData.userLocation,
          shippingAddress: orderData.shippingAddress,
          user: orderData.user,
          customer: orderData.customer
        });
        
        setOrderDetails(orderData);
        setAdditionalNote(response.data.order.delivery_instruction || '');
      } else {
        throw new Error(response.data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to fetch order details. Please try again.',
        [
          { text: 'Retry', onPress: fetchOrderDetails },
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCall = (type, phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone Number', 'Phone number not available');
    }
  };

  const handleDirection = async (type, address) => {
    try {
      let destinationAddress = '';
      let destinationName = '';
      let coordinates = null;
      
      if (type === 'customer') {
        destinationAddress = orderDetails?.shippingAddress?.address || 
                           orderDetails?.shippingAddress?.address1 || 
                           address || 
                           'Customer Address';
        destinationName = orderDetails?.user?.name || 
                         orderDetails?.shippingAddress?.name || 
                         'Customer';
        
        // Use userLocation coordinates if available
        if (orderDetails?.userLocation?.latitude && orderDetails?.userLocation?.longitude) {
          coordinates = {
            latitude: orderDetails.userLocation.latitude,
            longitude: orderDetails.userLocation.longitude
          };
        }
      } else if (type === 'restaurant') {
        destinationAddress = orderDetails?.store?.address || 
                           orderDetails?.store?.ShopAddress?.address || 
                           address || 
                           'Restaurant Address';
        destinationName = orderDetails?.store?.name || 'Restaurant';
      }

      if (!destinationAddress && !coordinates) {
        Alert.alert('Error', 'Destination address not available');
        return;
      }

      let mapsUrl = '';
      
      if (coordinates) {
        // Use coordinates for more accurate navigation
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
      } else {
        // Fallback to address-based navigation
        const encodedAddress = encodeURIComponent(destinationAddress);
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      }
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(mapsUrl);
      
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to Apple Maps on iOS or try alternative
        let fallbackUrl = '';
        if (coordinates) {
          fallbackUrl = Platform.OS === 'ios' 
            ? `http://maps.apple.com/?daddr=${coordinates.latitude},${coordinates.longitude}`
            : `geo:${coordinates.latitude},${coordinates.longitude}`;
        } else {
          const encodedAddress = encodeURIComponent(destinationAddress);
          fallbackUrl = Platform.OS === 'ios' 
            ? `http://maps.apple.com/?q=${encodedAddress}`
            : `geo:0,0?q=${encodedAddress}`;
        }
        
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.error('Error in handleDirection:', error);
      Alert.alert('Error', 'Failed to open directions. Please check if you have a maps app installed.');
    }
  };

  const handleSwipeConfirmation = () => {
    // Check if payment is required and not yet completed
    if (shouldShowQRPayment() && !isPaymentSucceeded) {
      Alert.alert(
        'Payment Required',
        'Please collect payment from customer before confirming delivery.',
        [
          { text: 'Collect Payment', onPress: handleShowQRPayment },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    setIsOtpModalVisible(true);
  };

  // Check if QR payment should be shown (non-COD orders)
  const shouldShowQRPayment = () => {
    // For testing: always show QR payment option
    // In production, uncomment the lines below to only show for non-COD orders
    return true;
    
    // const paymentMethod = orderDetails?.paymentInfo?.type || orderDetails?.paymentMethod;
    // return paymentMethod && paymentMethod.toLowerCase() !== 'cod' && paymentMethod.toLowerCase() !== 'cash_on_delivery';
  };

  // Show QR Payment Modal
  const handleShowQRPayment = async () => {
    setIsQRModalVisible(true);
    if (!qrData && isPaymentPending) {
      const result = await generateQRCode(orderId);
      if (!result.success) {
        Alert.alert('Error', result.message || 'Failed to generate QR code');
        setIsQRModalVisible(false);
      }
    }
  };


  // Handle QR Modal Close
  const handleCloseQRModal = () => {
    setIsQRModalVisible(false);
    if (!isPaymentSucceeded) {
      resetQRPayment();
    }
  };

  // Handle Cash Payment Confirmation
  const handleConfirmCashPayment = async (notes) => {
    const result = await confirmPaymentManually(orderId, 'cash', notes);
    if (result.success) {
      Alert.alert('Success', 'Cash payment confirmed successfully!');
      // Auto-close modal after success
      setTimeout(() => {
        setIsQRModalVisible(false);
      }, 2000);
    } else {
      Alert.alert('Error', result.message || 'Failed to confirm cash payment');
    }
  };

  // Handle QR Regeneration
  const handleRegenerateQR = async () => {
    const result = await regenerateQRCode();
    if (!result.success) {
      Alert.alert('Error', result.message || 'Failed to regenerate QR code');
    }
  };

  const confirmDeliveryWithOtp = async () => {
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit OTP');
      return;
    }

    setIsConfirming(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/order/deliveryman/confirm-delivery/${orderId}`,
        {
          otp: enteredOtp,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Order delivered successfully!');
        setIsOtpModalVisible(false);
        setEnteredOtp('');
        navigation.replace('OrderHistoryScreen');
      } else {
        throw new Error(response.data.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Error confirming delivery with OTP:', error);
      Alert.alert('Error', error.message || 'Failed to confirm delivery. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const getOrderStatus = (status) => {
    const statusConfig = {
      pending: { color: '#F59E0B', text: 'Pending' },
      confirmed: { color: '#10B981', text: 'Confirmed' },
      preparing: { color: '#3B82F6', text: 'Preparing' },
      ready: { color: '#8B5CF6', text: 'Ready' },
      picked_up: { color: '#EF4444', text: 'Picked Up' },
      shipping: { color: '#F59E0B', text: 'Shipping' },
      out_for_delivery: { color: '#FFD700', text: 'Out for delivery' },
      delivered: { color: '#059669', text: 'Delivered' },
      cancelled: { color: '#6B7280', text: 'Cancelled' },
    };
    return statusConfig[status] || { color: '#6B7280', text: 'Unknown' };
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Function to get properly formatted address
  const getFormattedAddress = () => {
    // Priority order for address sources
    const addressSources = [
      orderDetails?.userLocation?.deliveryAddress,
      orderDetails?.shippingAddress?.address,
      orderDetails?.shippingAddress?.address1,
      orderDetails?.user?.address,
      orderDetails?.customer?.address
    ];

    // Find the first non-empty address
    for (const address of addressSources) {
      if (address && address.trim() && address.toLowerCase() !== 'delhi') {
        return address.trim();
      }
    }

    // If no valid address found, try to construct from parts
    if (orderDetails?.shippingAddress) {
      const parts = [];
      if (orderDetails.shippingAddress.street) parts.push(orderDetails.shippingAddress.street);
      if (orderDetails.shippingAddress.locality) parts.push(orderDetails.shippingAddress.locality);
      if (orderDetails.shippingAddress.city) parts.push(orderDetails.shippingAddress.city);
      if (orderDetails.shippingAddress.state) parts.push(orderDetails.shippingAddress.state);
      if (orderDetails.shippingAddress.pincode) parts.push(orderDetails.shippingAddress.pincode);
      
      const constructedAddress = parts.join(', ');
      if (constructedAddress.trim() && constructedAddress.toLowerCase() !== 'delhi') {
        return constructedAddress;
      }
    }

    return 'Address not available';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <StatusBar barStyle="dark-content" backgroundColor={branding.primaryColor} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={branding.primaryColor} />
          <Text style={[styles.loadingText, { color: branding.textColor }]}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
        <StatusBar barStyle="dark-content" backgroundColor={branding.primaryColor} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={branding.primaryColor} />
          <Text style={[styles.errorText, { color: branding.textColor }]}>No order details found</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: branding.primaryColor }]}
            onPress={fetchOrderDetails}
          >
            <Icon name="refresh" size={20} color={branding.whiteColorText} />
            <Text style={[styles.retryButtonText, { color: branding.whiteColorText }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = getOrderStatus(orderDetails?.status);

  // Debugging logs for orderDetails and items before totalAmount calculation
  //console.log("Debugging: orderDetails before totalAmount:", orderDetails);
  //console.log("Debugging: orderDetails.items before totalAmount:", orderDetails?.items);

  const totalAmount = (orderDetails?.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  //console.log("Debugging: Calculated totalAmount:", totalAmount);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={branding.primaryColor} />
      
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: branding.backgroundColor, borderBottomColor: branding.secondaryBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={branding.textColor} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: branding.textColor }]}>Order #{orderId?.slice(-6)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: orderStatus.color }]}>
            <Text style={[styles.statusText, { color: branding.whiteColorText }]}>{orderStatus.text}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOrderDetails}>
          <Icon name="refresh" size={20} color={branding.textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: branding.backgroundColor }]}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleContainer}>
              <Text style={[styles.summaryTitle, { color: branding.textColor }]}>Order Summary</Text>
              {orderDetails?.userLocation?.latitude && (
                <View style={[styles.gpsBadge, { backgroundColor: branding.cartDiscountColor }]}>
                  <Icon name="location" size={12} color={branding.whiteColorText} />
                  <Text style={[styles.gpsBadgeText, { color: branding.whiteColorText }]}>GPS</Text>
                </View>
              )}
            </View>
            <Text style={[styles.summaryAmount, { color: branding.primaryColor }]}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: branding.textColor }]}>Payment Method:</Text>
              <View style={[styles.paymentBadge, { backgroundColor: branding.primaryColor }]}>
                <Text style={[styles.paymentText, { color: branding.whiteColorText }]}>{orderDetails?.paymentInfo?.type || 'COD'}</Text>
              </View>
            </View>
            
            {/* Payment Status Row */}
            {shouldShowQRPayment() && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: branding.textColor }]}>Payment Status:</Text>
                <View style={[
                  styles.paymentStatusBadge, 
                  { backgroundColor: isPaymentSucceeded ? branding.cartDiscountColor : branding.cartDeleteColor }
                ]}>
                  <Icon 
                    name={isPaymentSucceeded ? "checkmark-circle" : "time"} 
                    size={12} 
                    color={branding.whiteColorText} 
                  />
                  <Text style={[styles.paymentStatusText, { color: branding.whiteColorText }]}>
                    {isPaymentSucceeded ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: branding.textColor }]}>Items:</Text>
              <Text style={[styles.summaryValue, { color: branding.textColor }]}>{(orderDetails?.items?.length || 0)}</Text>
            </View>
            
            {/* Order Time */}
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: branding.textColor }]}>Order Time:</Text>
              <Text style={[styles.summaryValue, { color: branding.textColor }]}>
                {orderDetails?.createdAt ? 
                  new Date(orderDetails.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : 
                  orderDetails?.created_at ? 
                    new Date(orderDetails.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 
                    'N/A'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Restaurant Details */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="storefront" size={16} color="#6B7280" /> Store Details
          </Text>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.logoContainer}>
                {orderDetails?.store?.logo ? (
                  <Image 
                    source={{ uri: orderDetails.store.logo }} 
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>
                      {orderDetails?.store?.name?.charAt(0) || 'R'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>
                  {orderDetails?.store?.name || 'Shop Name'}
                </Text>
                <Text style={styles.detailSubtext} numberOfLines={2}>
                  {orderDetails?.store?.address || 'Address not available'}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall('restaurant', orderDetails?.store?.phone)}
              >
                <Icon name="call" size={16} color="#F16122" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.directionButton]}
                onPress={() => handleDirection('restaurant', orderDetails?.store?.address)}
              >
                <Icon name="navigate" size={16} color="#3B82F6" />
                <Text style={styles.directionText}>Direction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

        {/* Customer Contact Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
            <Icon name="person" size={16} color={branding.textColor} /> Customer Details
          </Text>
          <View style={[styles.detailCard, { backgroundColor: branding.backgroundColor }]}>
            <View style={styles.detailHeader}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: branding.primaryColor }]}>
                  <Text style={[styles.avatarText, { color: branding.whiteColorText }]}>
                    {orderDetails?.user?.name?.charAt(0) || 'C'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailName, { color: branding.textColor }]}>
                  {orderDetails?.user?.name || orderDetails?.shippingAddress?.name || 'Customer Name'}
                </Text>
                <Text style={[styles.detailSubtext, { color: branding.textColor }]} numberOfLines={2}>
                  {getFormattedAddress()}
                </Text>
                {(orderDetails?.user?.phoneNumber || orderDetails?.user?.phone || orderDetails?.shippingAddress?.phone) && (
                  <Text style={[styles.phoneText, { color: branding.primaryColor }]}>
                    {orderDetails?.user?.phoneNumber || orderDetails?.user?.phone || orderDetails?.shippingAddress?.phone}
                  </Text>
                )}
                {orderDetails?.user?.email && (
                  <Text style={[styles.emailText, { color: branding.textColor }]}>{orderDetails.user.email}</Text>
                )}
              </View>
            </View>
            
            {/* Enhanced Customer Information */}
            <View style={[styles.customerInfoContainer, { backgroundColor: branding.secondaryBackground }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>Name:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {orderDetails?.user?.name || orderDetails?.shippingAddress?.name || 'N/A'}
                </Text>
              </View>
              
              {orderDetails?.user?.email && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: branding.textColor }]}>Email:</Text>
                  <Text style={[styles.infoValue, { color: branding.textColor }]}>{orderDetails.user.email}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>Phone:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {orderDetails?.shippingAddress?.phone || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>Address:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {getFormattedAddress()}
                </Text>
              </View>
              
              {orderDetails?.shippingAddress?.locality && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: branding.textColor }]}>Locality:</Text>
                  <Text style={[styles.infoValue, { color: branding.textColor }]}>{orderDetails.shippingAddress.locality}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>City:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {orderDetails?.shippingAddress?.city || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>State:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {orderDetails?.shippingAddress?.state || orderDetails?.shippingAddress?.country || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: branding.textColor }]}>Pincode:</Text>
                <Text style={[styles.infoValue, { color: branding.textColor }]}>
                  {orderDetails?.shippingAddress?.pincode || orderDetails?.shippingAddress?.zipCode || 'N/A'}
                </Text>
              </View>
              
              {orderDetails?.shippingAddress?.addressType && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: branding.textColor }]}>Address Type:</Text>
                  <Text style={[styles.infoValue, { color: branding.textColor, textTransform: 'capitalize' }]}>
                    {orderDetails.shippingAddress.addressType}
                  </Text>
                </View>
              )}
              
              {orderDetails?.userLocation?.latitude && orderDetails?.userLocation?.longitude && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: branding.textColor }]}>Coordinates:</Text>
                  <Text style={[styles.infoValue, { color: branding.textColor }]}>
                    {orderDetails.userLocation.latitude.toFixed(6)}, {orderDetails.userLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
              
              {orderDetails?.userLocation?.deliveryAddress && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: branding.textColor }]}>Delivery Address:</Text>
                  <Text style={[styles.infoValue, { color: branding.textColor }]}>
                    {orderDetails.userLocation.deliveryAddress}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton, { backgroundColor: branding.secondaryBackground }]}
                onPress={() => handleCall('customer', orderDetails?.shippingAddress?.phone)}
              >
                <Icon name="call" size={16} color={branding.primaryColor} />
                <Text style={[styles.callText, { color: branding.primaryColor }]}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.directionButton, { backgroundColor: branding.secondaryBackground }]}
                onPress={() => handleDirection('customer', getFormattedAddress())}
              >
                <Icon name="navigate" size={16} color={branding.primaryColor} />
                <Text style={[styles.directionText, { color: branding.primaryColor }]}>
                  {orderDetails?.userLocation?.latitude ? 'GPS Direction' : 'Direction'}
                </Text>
                {orderDetails?.userLocation?.latitude && (
                  <Icon name="location" size={12} color={branding.cartDiscountColor} style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
            <Icon name="restaurant" size={16} color={branding.textColor} /> Order Items ({(orderDetails?.items || []).length || 0})
          </Text>

          {(orderDetails?.items || []).map((item, index) => (
            <View key={item._id || index} style={[styles.itemCard, { backgroundColor: branding.backgroundColor }]}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.itemImagePlaceholder, { backgroundColor: branding.secondaryBackground }]}>
                    <Icon name="fast-food" size={24} color={branding.textColor} />
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemName, { color: branding.textColor }]} numberOfLines={2}>{item.name}</Text>
                  <View style={[styles.quantityBadge, { backgroundColor: branding.secondaryBackground }]}>
                    <Text style={[styles.quantityText, { color: branding.textColor }]}>×{item.quantity}</Text>
                  </View>
                </View>
                <Text style={[styles.itemPrice, { color: branding.primaryColor }]}>{formatPrice(item.price * item.quantity)}</Text>
                {item.addons && item.addons.length > 0 && (
                  <Text style={[styles.itemAddons, { color: branding.textColor }]} numberOfLines={2}>
                    Add-ons: {item.addons.join(', ')}
                  </Text>
                )}
                {item.size && (
                  <Text style={[styles.itemSize, { color: branding.textColor }]}>Size: {item.size}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Note */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="document-text" size={16} color="#6B7280" /> Delivery Instructions
          </Text>
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              value={additionalNote}
              onChangeText={setAdditionalNote}
              multiline={true}
              placeholder="Add delivery instructions or notes..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View> */}


        {/* QR Payment Button - Show only for non-COD orders */}
        {shouldShowQRPayment() && (
          <TouchableOpacity 
            style={[
              styles.qrPaymentButton, 
              { 
                backgroundColor: isPaymentSucceeded ? branding.cartDiscountColor : branding.primaryColor,
                opacity: isPaymentSucceeded ? 0.8 : 1 
              }
            ]}
            onPress={handleShowQRPayment}
            activeOpacity={0.8}
            disabled={isPaymentSucceeded}
          >
            <View style={styles.qrPaymentContent}>
              {qrLoading ? (
                <ActivityIndicator size="small" color={branding.whiteColorText} />
              ) : (
                <Icon 
                  name={isPaymentSucceeded ? "checkmark-circle" : "qr-code"} 
                  size={24} 
                  color={branding.whiteColorText} 
                />
              )}
              <Text style={[styles.qrPaymentText, { color: branding.whiteColorText }]}>
                {isPaymentSucceeded ? 'Payment Received' : 'Collect Payment'}
              </Text>
              {!qrLoading && !isPaymentSucceeded && (
                <Icon name="arrow-forward" size={20} color={branding.whiteColorText} />
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Enhanced Confirmation Button */}
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            { 
              backgroundColor: branding.primaryColor,
              opacity: (shouldShowQRPayment() && !isPaymentSucceeded) ? 0.6 : 1
            }
          ]}
          onPress={handleSwipeConfirmation}
          activeOpacity={0.8}
          disabled={(shouldShowQRPayment() && !isPaymentSucceeded) || isConfirming}
        >
          <View style={styles.confirmContent}>
            {isConfirming ? (
              <ActivityIndicator size="small" color={branding.whiteColorText} />
            ) : (
              <Icon name="checkmark-circle" size={24} color={branding.whiteColorText} />
            )}
            <Text style={[styles.confirmText, { color: branding.whiteColorText }]}>Confirm Order Delivery</Text>
            {!isConfirming && <Icon name="arrow-forward" size={20} color={branding.whiteColorText} />}
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* OTP Input Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isOtpModalVisible}
        onRequestClose={() => setIsOtpModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: branding.backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: branding.textColor }]}>Enter OTP</Text>
            <TextInput
              style={[styles.otpInput, { borderColor: branding.secondaryBackground, color: branding.textColor }]}
              keyboardType="numeric"
              maxLength={6}
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              placeholder="_ _ _ _ _ _"
              placeholderTextColor={branding.textColor}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: branding.cartDeleteColor }]}
                onPress={() => setIsOtpModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: branding.whiteColorText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmOtpButton, { backgroundColor: branding.primaryColor }]}
                onPress={confirmDeliveryWithOtp}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color={branding.whiteColorText} />
                ) : (
                  <Text style={[styles.buttonText, { color: branding.whiteColorText }]}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Payment Modal */}
      <QRPaymentModal
        visible={isQRModalVisible}
        onClose={handleCloseQRModal}
        qrData={qrData}
        paymentStatus={paymentStatus}
        loading={qrLoading}
        error={qrError}
        isMonitoring={isMonitoring}
        onConfirmCashPayment={handleConfirmCashPayment}
        onRegenerateQR={handleRegenerateQR}
        orderDetails={{
          totalAmount: totalAmount,
          customerName: orderDetails?.user?.name || orderDetails?.shippingAddress?.name,
          orderId: orderId,
        }}
      />

      <BottomTab screen="ORDERS" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  gpsBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryDetails: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  customerInfoContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  callButton: {
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  directionButton: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callText: {
    fontSize: 14,
    fontWeight: '600',
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  itemImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemAddons: {
    fontSize: 12,
    marginBottom: 2,
    fontStyle: 'italic',
  },
  itemSize: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 16,
  },
  noteInput: {
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    lineHeight: 20,
  },
  qrPaymentButton: {
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  qrPaymentContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  qrPaymentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 16,
    shadowColor: '#F16122',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  otpInput: {
    width: 150,
    height: 50,
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
  },
  confirmOtpButton: {
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default OrderDetailsScreen;