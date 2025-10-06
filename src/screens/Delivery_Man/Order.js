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
import { useUserContext } from '../../context/User';
import { API_URL } from '../../config/api';
import axios from 'axios';
import { useConfiguration } from '../../context/Configuration';
import { getAppName } from '../../services/configService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppBranding } from '../../utils/translationHelper';
import * as Location from 'expo-location';
import LocationPermission from '../../components/LocationPermission/LocationPermission';

const OrderRequestScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryManId, setDeliveryManId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalNote, setAdditionalNote] = useState('');
  const [locationPermission, setLocationPermission] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('processing'); // New state for active tab
  const [ignoredOrderIds, setIgnoredOrderIds] = useState(new Set()); // Track ignored orders locally
  const { token, formetedProfileData, isDeliveryMan, logout } = useUserContext();
  const configuration = useConfiguration();
  const appName = getAppName(configuration.config);
  const branding = useAppBranding();

  useEffect(() => {
    checkLocationPermission();
    loadIgnoredOrders();
    fetchOrders();
  }, [token]);

  const loadIgnoredOrders = async () => {
    try {
      const ignoredOrders = await AsyncStorage.getItem('ignoredOrders');
      if (ignoredOrders) {
        setIgnoredOrderIds(new Set(JSON.parse(ignoredOrders)));
      }
    } catch (error) {
      console.error('Error loading ignored orders:', error);
    }
  };

  const saveIgnoredOrders = async (ignoredSet) => {
    try {
      await AsyncStorage.setItem('ignoredOrders', JSON.stringify([...ignoredSet]));
    } catch (error) {
      console.error('Error saving ignored orders:', error);
    }
  };

  const clearIgnoredOrders = async () => {
    try {
      setIgnoredOrderIds(new Set());
      await AsyncStorage.removeItem('ignoredOrders');
      console.log('Ignored orders cleared');
    } catch (error) {
      console.error('Error clearing ignored orders:', error);
    }
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });
        setCurrentLocation(location.coords);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationPermission('denied');
    }
  };

  const handleLocationGranted = (coords) => {
    setCurrentLocation(coords);
    setLocationPermission('granted');
  };

  const handleLocationDenied = () => {
    setLocationPermission('denied');
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      // Get delivery man ID first
      const meResponse = await axios.get(`${API_URL}/deliveryman/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!meResponse.data.success || !meResponse.data.deliveryMan?._id) {
        throw new Error('Invalid delivery man data received');
      }

      const currentDeliveryManId = meResponse.data.deliveryMan._id;
      setDeliveryManId(currentDeliveryManId);

      // Fetch orders
      const ordersResponse = await axios.get(`${API_URL}/deliveryman/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!ordersResponse.data.success || !Array.isArray(ordersResponse.data.orders)) {
        throw new Error('Invalid orders data received');
      }

      setOrders(ordersResponse.data.orders);

    } catch (error) {
      console.error("Error in fetchOrders:", error);

      if (error.response?.status === 401) {
        logout();
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

  // Categorize orders by status
  const categorizeOrders = (ordersList) => {
    console.log('=== ORDER FILTERING DEBUG ===');
    console.log('Total orders received:', ordersList.length);
    console.log('Ignored order IDs:', [...ignoredOrderIds]);
    console.log('Delivery man ID:', deliveryManId);
    
    // Filter out ignored orders from all categories using multiple criteria
    const filteredOrders = ordersList.filter(order => {
      // Check if order is in our local ignored set
      if (ignoredOrderIds.has(order._id)) {
        console.log(`Order ${order._id} filtered: In local ignored set`);
        return false;
      }
      
      // Check for various ignore statuses
      const ignoreStatuses = [
        'IGNORED', 
        'REJECTED', 
        'IGNORED_BY_DELIVERYMAN',
        'IGNORED_BY_DELIVERY_MAN',
        'DELIVERYMAN_IGNORED',
        'DELIVERY_MAN_IGNORED',
        'CANCELLED_BY_DELIVERYMAN',
        'CANCELLED_BY_DELIVERY_MAN'
      ];
      
      if (ignoreStatuses.includes(order.status)) {
        console.log(`Order ${order._id} filtered: Status is ${order.status}`);
        return false;
      }
      
      // Check for ignore flags
      if (order.isIgnored || order.ignored || order.rejected || order.isRejected) {
        console.log(`Order ${order._id} filtered: Has ignore flag`, {
          isIgnored: order.isIgnored,
          ignored: order.ignored,
          rejected: order.rejected,
          isRejected: order.isRejected
        });
        return false;
      }
      
      // Check if order has been ignored by this delivery man
      if (order.ignoredBy === deliveryManId || order.ignored_by === deliveryManId) {
        console.log(`Order ${order._id} filtered: Ignored by this delivery man`);
        return false;
      }
      
      console.log(`Order ${order._id} passed filtering: Status=${order.status}`);
      return true;
    });
    
    console.log('Orders after filtering:', filteredOrders.length);
    console.log('=== END FILTERING DEBUG ===');

    const processing = filteredOrders.filter(order => 
      order.status === 'PENDING' || 
      order.status === 'ACCEPTED' || 
      order.status === 'ASSIGNED' ||
      order.status === 'Processing'
    );
    
    const outForDelivery = filteredOrders.filter(order => 
      order.status === 'PICKED' || 
      order.status === 'out_for_delivery' ||
      order.status === 'Out for delivery'
    );
    
    const delivered = filteredOrders.filter(order => 
      order.status === 'DELIVERED' || 
      order.status === 'COMPLETED' ||
      order.status === 'Delivered'
    );
    
    return { processing, outForDelivery, delivered };
  };

  // Get orders for current active tab
  const getCurrentTabOrders = () => {
    const categorized = categorizeOrders(orders);
    switch (activeTab) {
      case 'processing':
        return categorized.processing;
      case 'outForDelivery':
        return categorized.outForDelivery;
      case 'delivered':
        return categorized.delivered;
      default:
        return categorized.processing;
    }
  };

  // Get tab counts
  const getTabCounts = () => {
    const categorized = categorizeOrders(orders);
    return {
      processing: categorized.processing.length,
      outForDelivery: categorized.outForDelivery.length,
      delivered: categorized.delivered.length,
    };
  };

  useEffect(() => {
    if (token && isDeliveryMan()) {
      fetchOrders();
    }
  }, [token]);

  const handleAccept = async (orderId) => {
    const token = await AsyncStorage.getItem('token');
    if (!orderId || !deliveryManId) {
      Alert.alert('Error', 'Invalid order or delivery man ID');
      return;
    }

    try {
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

      if (error.response?.status === 401) {
        logout();
        Alert.alert(
          'Session Expired',
          'Please login again',
          [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) }]
        );
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Order not found');
      } else if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.message || 'Cannot accept this order');
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
        // Add to ignored orders set
        const newIgnoredSet = new Set([...ignoredOrderIds, orderId]);
        setIgnoredOrderIds(newIgnoredSet);
        // Save to AsyncStorage
        saveIgnoredOrders(newIgnoredSet);
        // Remove the ignored order from the list
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        // Refresh the orders list to get updated data
        fetchOrders();
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
        logout();
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

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabCounts = getTabCounts();
    
    const tabs = [
      { key: 'processing', label: 'Processing', count: tabCounts.processing, icon: 'hourglass-outline' },
      { key: 'outForDelivery', label: 'Out for Delivery', count: tabCounts.outForDelivery, icon: 'bicycle-outline' },
      { key: 'delivered', label: 'Delivered', count: tabCounts.delivered, icon: 'checkmark-circle-outline' },
    ];

    return (
      <View style={[styles.tabContainer, { backgroundColor: branding.backgroundColor }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
                { 
                  backgroundColor: activeTab === tab.key ? branding.primaryColor : branding.secondaryBackground,
                  borderColor: activeTab === tab.key ? branding.primaryColor : branding.secondaryBackground
                }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Icon 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.key ? branding.whiteColorText : branding.textColor} 
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? branding.whiteColorText : branding.textColor }
              ]}>
                {tab.label}
              </Text>
              <View style={[
                styles.tabCount,
                { backgroundColor: activeTab === tab.key ? branding.whiteColorText : branding.primaryColor }
              ]}>
                <Text style={[
                  styles.tabCountText,
                  { color: activeTab === tab.key ? branding.primaryColor : branding.whiteColorText }
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const OrderCard = ({ order }) => {
    const isAssigned = order?.delivery_man !== null && order?.delivery_man !== undefined;
    const isAssignedToMe = order?.delivery_man?._id === deliveryManId;
    const orderStatus = order?.status || 'Processing';

    const formatAddress = (address) => {
      if (!address) return 'Address not available';
      return `${address.street || ''} ${address.city || ''} ${address.state || ''} ${address.zipCode || ''}`.trim();
    };

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: branding.backgroundColor }]}
        onPress={() => navigation.navigate('OrderDetailsScreen', {
          orderId: order?._id,
          restaurant: {
            name: order?.cart?.[0]?.shopId?.name || appName,
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
          <View style={styles.orderInfo}>
            <Text style={[styles.orderId, { color: branding.textColor }]}>Order #{order._id.slice(-6)}</Text>
            <Text style={[styles.orderTime, { color: branding.textColor }]}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })} {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </Text>
          </View>
          <View style={styles.distanceInfo}>
            <Text style={[styles.distanceText, { color: branding.textColor }]}>
              {order.distance?.km ? `${order.distance.km.toFixed(1)} km` : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: branding.secondaryBackground }]}>
              <MaterialIcon name="store" size={18} color={branding.primaryColor} />
            </View>
            <Text style={[styles.restaurantText, { color: branding.textColor }]}>
              {order?.cart?.[0]?.shopId?.name || appName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconContainer, { backgroundColor: branding.secondaryBackground }]}>
              <MaterialIcon name="location-on" size={18} color={branding.primaryColor} />
            </View>
            <Text style={[styles.addressText, { color: branding.textColor }]} numberOfLines={2}>
              {formatAddress(order?.shippingAddress)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {isAssigned ? (
            <View style={[styles.assignedContainer, { backgroundColor: branding.secondaryBackground }]}>
              <Text style={[styles.assignedText, { color: branding.textColor }]}>
                {isAssignedToMe ? 'Assigned to you' : 'Assigned to another delivery man'}
              </Text>
              {isAssignedToMe && orderStatus === 'Out for delivery' && (
                <TouchableOpacity
                  style={[styles.trackButton, { backgroundColor: branding.primaryColor }]}
                  onPress={() => navigation.navigate('DeliveryTrackingScreen', { orderId: order?._id })}
                >
                  <Text style={[styles.trackButtonText, { color: branding.whiteColorText }]}>Track Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            orderStatus === 'Processing' && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.detailsBtn, { backgroundColor: branding.secondaryBackground }]}
                  onPress={() => handleIgnore(order?._id)}
                >
                  <MaterialIcon name="close" size={18} color={branding.textColor} />
                  <Text style={[styles.detailsBtnText, { color: branding.textColor }]}>Ignore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.directionBtn, { backgroundColor: branding.primaryColor }]}
                  onPress={() => handleAccept(order?._id)}
                >
                  <MaterialIcon name="check" size={18} color={branding.whiteColorText} />
                  <Text style={[styles.directionBtnText, { color: branding.whiteColorText }]}>Accept</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Show location permission screen if location is not granted
  if (locationPermission !== 'granted') {
    return (
      <LocationPermission
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={branding.primaryColor} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: branding.backgroundColor, borderBottomColor: branding.secondaryBackground }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={branding.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: branding.textColor }]}>Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
            <Icon name="refresh" size={20} color={branding.textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <TabNavigation />

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
            <ActivityIndicator size="large" color={branding.primaryColor} />
            <Text style={[styles.loadingText, { color: branding.textColor }]}>Loading orders...</Text>
          </View>
        ) : getCurrentTabOrders().length > 0 ? (
          getCurrentTabOrders().map((order) => (
            <OrderCard key={order._id} order={order} />
          ))
        ) : (
          <View style={styles.noOrders}>
            <MaterialIcon 
              name={
                activeTab === 'processing' ? 'hourglass-empty' :
                activeTab === 'outForDelivery' ? 'bicycle' : 'check-circle'
              } 
              size={64} 
              color={branding.textColor} 
            />
            <Text style={[styles.noOrdersText, { color: branding.textColor }]}>
              {activeTab === 'processing' ? 'No processing orders' :
               activeTab === 'outForDelivery' ? 'No out for delivery orders' : 'No delivered orders'}
            </Text>
            <Text style={[styles.noOrdersSubText, { color: branding.textColor }]}>
              {activeTab === 'processing' ? 'New orders will appear here when available' :
               activeTab === 'outForDelivery' ? 'Orders ready for delivery will appear here' : 'Completed orders will appear here'}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 34,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  tabContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minWidth: 120,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '700',
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
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 8,
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
  },
  detailsBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  directionBtn: {
  },
  directionBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  assignedContainer: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  trackButtonText: {
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
    marginTop: 16,
  },
  noOrdersSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default OrderRequestScreen;