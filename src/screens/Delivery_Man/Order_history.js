import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BottomTab from '../../components/BottomTab/BottomTab';
const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const orderHistory = [
    {
      id: 1,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    },
    {
      id: 2,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    },
    {
      id: 3,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    },
    {
      id: 4,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    },
    {
      id: 5,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    },
    {
      id: 6,
      orderNumber: "#2CE5DW",
      items: 2,
      date: "30/04/2021",
      time: "11:05 AM"
    }
  ];

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetailsScreen', { orderId: order.id });
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
        <Text style={styles.orderNumber}>Order ID: {order.orderNumber}</Text>
        <Text style={styles.itemCount}>{order.items} Items</Text>
        
        <View style={styles.orderMeta}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.metaIcon}>⏰</Text>
            <Text style={styles.dateTime}>{order.date} | {order.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        {orderHistory.map((order) => (
          <OrderItem key={order.id} order={order} />
        ))}
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
  backArrow: {
    fontSize: 18,
    color: '#374151',
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
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  navIcon: {
    fontSize: 20,
  },
});

export default OrderHistoryScreen;