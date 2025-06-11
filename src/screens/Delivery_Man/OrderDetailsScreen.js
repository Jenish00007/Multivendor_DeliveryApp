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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import axios from 'axios';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [additionalNote, setAdditionalNote] = useState('');
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

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
        setOrderDetails({ 
          ...response.data.order,
          items: response.data.order.items || []
        });
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

  const handleDirection = (type, address) => {
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    } else {
      Alert.alert('No Address', 'Address not available');
    }
  };

  const handleSwipeConfirmation = () => {
    setIsOtpModalVisible(true);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F16122" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>No order details found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOrderDetails}
          >
            <Icon name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderStatus = getOrderStatus(orderDetails?.status);

  // Debugging logs for orderDetails and items before totalAmount calculation
  console.log("Debugging: orderDetails before totalAmount:", orderDetails);
  console.log("Debugging: orderDetails.items before totalAmount:", orderDetails?.items);

  const totalAmount = (orderDetails?.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  console.log("Debugging: Calculated totalAmount:", totalAmount);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order #{orderId?.slice(-6)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: orderStatus.color }]}>
            <Text style={styles.statusText}>{orderStatus.text}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOrderDetails}>
          <Icon name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <Text style={styles.summaryAmount}>{formatPrice(totalAmount)}</Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method:</Text>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentText}>{orderDetails?.paymentInfo?.type || 'COD'}</Text>
              </View>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items:</Text>
              <Text style={styles.summaryValue}>{(orderDetails?.items?.length || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Restaurant Details */}
        <View style={styles.section}>
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
                  {orderDetails?.store?.name || 'Restaurant Name'}
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
        </View>

        {/* Customer Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="person" size={16} color="#6B7280" /> Customer Details
          </Text>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {orderDetails?.user?.name?.charAt(0) || 'C'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>
                  {orderDetails?.user?.name || 'Customer Name'}
                </Text>
                <Text style={styles.detailSubtext} numberOfLines={2}>
                  {orderDetails?.shippingAddress?.address || 'Address not available'}
                </Text>
                {orderDetails?.user?.phone && (
                  <Text style={styles.phoneText}>{orderDetails.user.phone}</Text>
                )}
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall('customer', orderDetails?.user?.phone)}
              >
                <Icon name="call" size={16} color="#F16122" />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.directionButton]}
                onPress={() => handleDirection('customer', orderDetails?.shippingAddress?.address)}
              >
                <Icon name="navigate" size={16} color="#3B82F6" />
                <Text style={styles.directionText}>Direction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="restaurant" size={16} color="#6B7280" /> Order Items ({(orderDetails?.items || []).length || 0})
          </Text>

          {(orderDetails?.items || []).map((item, index) => (
            <View key={item._id || index} style={styles.itemCard}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Icon name="fast-food" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>×{item.quantity}</Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                {item.addons && item.addons.length > 0 && (
                  <Text style={styles.itemAddons} numberOfLines={2}>
                    Add-ons: {item.addons.join(', ')}
                  </Text>
                )}
                {item.size && (
                  <Text style={styles.itemSize}>Size: {item.size}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Note */}
        <View style={styles.section}>
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
        </View>

        {/* Enhanced Confirmation Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleSwipeConfirmation}
          activeOpacity={0.8}
        >
          <View style={styles.confirmContent}>
            {isConfirming ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.confirmText}>Confirm Order Delivery</Text>
            {!isConfirming && <Icon name="arrow-forward" size={20} color="#FFFFFF" />}
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
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={6}
              value={enteredOtp}
              onChangeText={setEnteredOtp}
              placeholder="_ _ _ _ _ _"
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsOtpModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmOtpButton]}
                onPress={confirmDeliveryWithOtp}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTab screen="ORDERS" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F16122',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  paymentBadge: {
    backgroundColor: '#F16122',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  paymentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F16122',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: '#10B981',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailSubtext: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '500',
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  directionButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  callText: {
    color: '#F16122',
    fontSize: 14,
    fontWeight: '600',
  },
  directionText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3F4F6',
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
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  quantityBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F16122',
    marginBottom: 4,
  },
  itemAddons: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  itemSize: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 16,
  },
  noteInput: {
    fontSize: 14,
    color: '#374151',
    textAlignVertical: 'top',
    minHeight: 80,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#F16122',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 32,
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#F16122',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
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
    backgroundColor: 'white',
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
    color: '#1F2937',
  },
  otpInput: {
    width: 150,
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 2,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
    backgroundColor: '#EF4444',
  },
  confirmOtpButton: {
    backgroundColor: '#F16122',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default OrderDetailsScreen;