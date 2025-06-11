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
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import axios from 'axios';

const OrderRequestScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryManId, setDeliveryManId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalNote, setAdditionalNote] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders...");
      
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert(
          "Authentication Required",
          "Please login to view orders",
          [{ text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
        );
        return;
      }

      const authToken = `Bearer ${storedToken}`;
      
      // Get delivery man ID first
      const meResponse = await axios.get(`${API_URL}/deliveryman/me`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!meResponse.data.success || !meResponse.data.deliveryMan?._id) {
        throw new Error('Invalid delivery man data received');
      }

      const currentDeliveryManId = meResponse.data.deliveryMan._id;
      setDeliveryManId(currentDeliveryManId);
      console.log("Delivery man ID set:", currentDeliveryManId);

      // Fetch orders
      const ordersResponse = await axios.get(`${API_URL}/deliveryman/orders`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!ordersResponse.data.success || !Array.isArray(ordersResponse.data.orders)) {
        throw new Error('Invalid orders data received');
      }

      setOrders(ordersResponse.data.orders);
      console.log("Orders set successfully:", ordersResponse.data.orders.length);

    } catch (error) {
      console.error("Error in fetchOrders:", error);
      
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        Alert.alert(
          "Session Expired",
          "Please login again",
          [{ text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
        );
        return;
      }

      Alert.alert(
        "Error",
        error.message || 'Failed to fetch orders',
        [
          { text: "Retry", onPress: fetchOrders },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    if (!orderId || !deliveryManId) {
      Alert.alert('Error', 'Invalid order or delivery man ID');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/order/deliveryman/accept-order/${orderId}`,
        {
          delivery_instruction: 'test'
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
        Alert.alert('Success', 'Order accepted successfully');
        fetchOrders(); // Refresh the orders list
      } else {
        throw new Error(response.data.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      
      if (error.response?.status === 404) {
        Alert.alert(
          'Error',
          'Unable to accept order. The order may have been taken by another delivery person.',
          [{ text: 'OK' }]
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please login again',
          [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to accept order. Please try again.',
          [
            { text: 'Retry', onPress: () => handleAccept(orderId) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    }
  };

  const handleIgnore = async (orderId) => {
    if (!orderId || !deliveryManId) {
      Alert.alert('Error', 'Invalid order or delivery man ID');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${API_URL}/order/deliveryman/ignore-order/${orderId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Order ignored successfully');
        // Remove the ignored order from the list
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      } else {
        throw new Error(response.data.message || 'Failed to ignore order');
      }
    } catch (error) {
      console.error('Error ignoring order:', error);
      
      if (error.response?.status === 404) {
        Alert.alert('Error', 'Order not found');
      } else if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.message || 'Cannot ignore this order');
      } else if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Please login again',
          [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to ignore order. Please try again.',
          [
            { text: 'Retry', onPress: () => handleIgnore(orderId) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    }
  };

  const OrderCard = ({ order }) => {
    const isAssigned = order?.delivery_man !== null && order?.delivery_man !== undefined;
    const isAssignedToMe = order?.delivery_man?._id === deliveryManId;
    const orderStatus = order?.status || 'Processing';

    const formatAddress = (address) => {
      if (!address) return 'Delivery Address';
      if (typeof address === 'string') return address;
      
      // Handle address object
      const parts = [];
      if (address.name) parts.push(address.name);
      if (address.address) parts.push(address.address);
      if (address.locality) parts.push(address.locality);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.pincode) parts.push(address.pincode);
      
      return parts.join(', ');
    };

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: '#ffffff' }]} 
        onPress={() => navigation.navigate('OrderDetailsScreen', { 
          orderId: order?._id,
          restaurant: {
            name: order?.cart?.[0]?.shopId?.name || 'Qauds',
            cuisine: order?.cart?.[0]?.shopId?.cuisine || '',
            phone: order?.cart?.[0]?.shopId?.phone || 'Phone',
            address: order?.cart?.[0]?.shopId?.address || 'Address'
          },
          customer: {
            name: order?.user?.name || 'Customer Name',
            address: formatAddress(order?.shippingAddress),
            phone: order?.user?.phone || 'Phone'
          },
          items: order?.cart?.map(item => ({
            id: item?._id,
            name: item?.name || 'Item Name',
            price: `₹${item?.price || 0}`,
            quantity: item?.quantity || 0,
            addons: item?.addons ? `Addons: ${item.addons.join(' + ')}` : '',
            size: item?.size ? `Size: ${item.size}` : ''
          })) || [],
          totalItems: order?.cart?.length || 0,
          paymentMethod: order?.paymentMethod || 'COD',
          additionalNote: order?.note || ''
        })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={[styles.orderIdLabel, { color: '#374151' }]}>Order ID</Text>
            <Text style={[styles.orderId, { color: '#374151' }]}>#{order?._id?.slice(-6) || 'N/A'}</Text>
          </View>
          <View style={[styles.paymentBadge, { 
            backgroundColor: order?.paymentMethod === 'COD' ? '#FF6B6B' : '#4ECDC4' 
          }]}>
            <Text style={styles.paymentText}>{order?.paymentMethod || 'COD'}</Text>
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcon name="store" size={18} color="#FF6B6B" />
            </View>
            <Text style={[styles.restaurantText, { color: '#374151' }]}>
              {order?.cart?.[0]?.shopId?.name || 'Qauds'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcon name="location-on" size={18} color="#FF6B6B" />
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {formatAddress(order?.shippingAddress)}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          {isAssigned ? (
            <View style={styles.assignedContainer}>
              <Text style={styles.assignedText}>
                {isAssignedToMe ? 'Assigned to you' : 'Assigned to another delivery man'}
              </Text>
              {isAssignedToMe && orderStatus === 'Out for delivery' && (
                <TouchableOpacity 
                  style={styles.trackButton}
                  onPress={() => navigation.navigate('DeliveryTrackingScreen', { orderId: order?._id })}
                >
                  <Text style={styles.trackButtonText}>Track Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            orderStatus === 'Processing' && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.detailsBtn]}
                  onPress={() => handleIgnore(order?._id)}
                >
                  <MaterialIcon name="close" size={18} color="#6B7280" />
                  <Text style={styles.detailsBtnText}>Ignore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.directionBtn]}
                  onPress={() => handleAccept(order?._id)}
                >
                  <MaterialIcon name="check" size={18} color="#ffffff" />
                  <Text style={styles.directionBtnText}>Accept</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Request</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F16122" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <View style={styles.noOrders}>
            <MaterialIcon name="delivery-dining" size={64} color="#D1D5DB" />
            <Text style={styles.noOrdersText}>No orders available</Text>
            <Text style={styles.noOrdersSubText}>
              New orders will appear here when available
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomTab screen="ORDERS" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  headerSpacer: {
    width: 34,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  restaurantText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailsBtn: {
    backgroundColor: '#F3F4F6',
  },
  detailsBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  directionBtn: {
    backgroundColor: '#F16122',
  },
  directionBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  assignedContainer: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  trackButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  noOrders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOrdersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  noOrdersSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default OrderRequestScreen;