import React, { useState } from 'react';
import BottomTab from '../../components/BottomTab/BottomTab';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const OrderRequestScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([
    {
      id: 1,
      restaurant: "Mc Donald's",
      cuisine: "American cuisine, fast food",
      items: 2,
      timeAgo: "2 mins Ago",
      tag: "COD",
      tagColor: "#10B981"
    },
    {
      id: 2,
      restaurant: "Mc Donald's",
      cuisine: "American cuisine, fast food",
      items: 2,
      timeAgo: "2 mins Ago",
      tag: "Digitally Paid",
      tagColor: "#10B981"
    },
    {
      id: 3,
      restaurant: "Mc Donald's",
      cuisine: "American cuisine, fast food",
      items: 2,
      timeAgo: "2 mins Ago",
      tag: "COD",
      tagColor: "#10B981"
    },
    {
      id: 4,
      restaurant: "Mc Donald's",
      cuisine: "American cuisine, fast food",
      items: 2,
      timeAgo: "2 mins Ago",
      tag: "COD",
      tagColor: "#10B981"
    }
  ]);

  const handleAccept = (orderId) => {
    console.log(`Order ${orderId} accepted`);
    // Handle accept logic here
  };

  const handleIgnore = (orderId) => {
    console.log(`Order ${orderId} ignored`);
    // Handle ignore logic here
  };

  const OrderCard = ({ order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.restaurantInfo}>
          <View style={styles.logoContainer}>
            <View style={styles.mcdonaldsLogo}>
              <Text style={styles.logoText}>M</Text>
            </View>
          </View>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{order.restaurant}</Text>
            <Text style={styles.cuisineType}>{order.cuisine}</Text>
          </View>
        </View>
        <View style={[styles.tag, { backgroundColor: order.tagColor }]}>
          <Text style={styles.tagText}>{order.tag}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.itemCount}>{order.items} Items</Text>
        <Text style={styles.timeAgo}>{order.timeAgo}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.ignoreButton}
          onPress={() => handleIgnore(order.id)}
        >
          <Text style={styles.ignoreButtonText}>Ignore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAccept(order.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
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
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  mcdonaldsLogo: {
    width: 48,
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  cuisineType: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ignoreButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  ignoreButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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

export default OrderRequestScreen;