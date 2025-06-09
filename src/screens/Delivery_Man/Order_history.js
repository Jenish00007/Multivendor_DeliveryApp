import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BottomTab from '../../components/BottomTab/BottomTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_URL}/order/deliveryman/order-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-localization': 'en',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order history');
      }

      // Transform the data to match our display format
      const transformedOrders = (data.orders || []).map(order => ({
        id: order._id,
        order_number: order.order_number || order._id,
        order_items_count: order.items?.length || 0,
        created_at: new Date(order.created_at).toLocaleString(),
        status: order.status,
        payment_method: order.payment_method,
        total_amount: order.total_amount,
        delivery_address: order.delivery_address,
        restaurant_name: order.restaurant?.name || 'Store',
      }));

      setOrderHistory(transformedOrders);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetailsScreen', { 
      orderId: order.id,
      order: order
    });
  };

  const OrderItem = ({ order }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => handleOrderPress(order)}
    >
      <View style={styles.orderImageContainer}>
        <View style={styles.foodImage}>
          <Text style={styles.foodEmoji}>🍔</Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderNumber}>Order ID: {order.order_number}</Text>
        <Text style={styles.itemCount}>{order.order_items_count} Items</Text>
        <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
        
        <View style={styles.orderMeta}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.metaIcon}>⏰</Text>
            <Text style={styles.dateTime}>{order.created_at}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      case 'processing':
        return '#2196F3';
      case 'out_for_delivery':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F16122" />
          <Text style={styles.loadingText}>Loading order history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#F16122" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order History List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {orderHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No order history found</Text>
          </View>
        ) : (
          orderHistory.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))
        )}
      </ScrollView>

      <BottomTab screen="HISTORY" />
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
    paddingTop: 8,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderImageContainer: {
    marginRight: 12,
  },
  foodImage: {
    width: 60,
    height: 60,
    backgroundColor: '#8B4513',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  foodEmoji: {
    fontSize: 28,
  },
  orderDetails: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  dateTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F16122',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;