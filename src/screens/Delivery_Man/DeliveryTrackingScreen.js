import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const DeliveryTrackingScreen = () => {
  const [status, setStatus] = useState('Delivering');

  const orderData = {
    orderNumber: "#2345",
    transactionNo: "324U12U124",
    deliveryPin: "2235",
    deliveryType: "Cash on Delivery",
    amount: "₹600",
    pickupAddress: "Taman Rumpun Bahagia 75300, Melaka",
    deliveryAddress: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    customer: {
      name: "David Alaba",
      role: "Customer"
    }
  };

  const handleFinish = () => {
    setStatus('Delivered');
    console.log('Order finished');
  };

  const handleCall = () => {
    console.log('Calling customer');
  };

  // Example coordinates (replace with real data)
  const pickupCoords = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
  const deliveryCoords = { latitude: 37.7849, longitude: -122.4094 }; // Nearby

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order {orderData.orderNumber}</Text>
          <Text style={styles.transactionNo}>Transaction no {orderData.transactionNo}</Text>
        </View>
        <View style={styles.deliveryPin}>
          <Text style={styles.pinLabel}>Delivery Pin:</Text>
          <Text style={styles.pinNumber}>{orderData.deliveryPin}</Text>
        </View>
      </View>

      {/* Delivery Type Bar */}
      <View style={styles.deliveryTypeBar}>
        <View style={styles.deliveryTypeLeft}>
          <Text style={styles.deliveryTypeLabel}>Delivery Type</Text>
          <Text style={styles.deliveryTypeValue}>{orderData.deliveryType}</Text>
        </View>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>{orderData.amount}</Text>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: (pickupCoords.latitude + deliveryCoords.latitude) / 2,
            longitude: (pickupCoords.longitude + deliveryCoords.longitude) / 2,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          <Marker
            coordinate={pickupCoords}
            title="Pickup"
            description={orderData.pickupAddress}
            pinColor="green"
          />
          <Marker
            coordinate={deliveryCoords}
            title="Delivery"
            description={orderData.deliveryAddress}
            pinColor="red"
          />
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Address Information */}
        <View style={styles.addressSection}>
          <View style={styles.addressItem}>
            <View style={styles.addressDot} />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Pickup from</Text>
              <Text style={styles.addressText}>{orderData.pickupAddress}</Text>
            </View>
          </View>
          
          <View style={styles.routeDivider} />
          
          <View style={styles.addressItem}>
            <View style={[styles.addressDot, styles.deliveryDot]} />
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Delivery to</Text>
              <Text style={[styles.addressText, styles.deliveryAddressText]}>{orderData.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <View style={styles.customerAvatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{orderData.customer.name}</Text>
              <Text style={styles.customerRole}>{orderData.customer.role}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Status and Action */}
        <View style={styles.actionSection}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>{status}</Text>
          </View>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishIcon}>✓</Text>
            <Text style={styles.finishText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  transactionNo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deliveryPin: {
    alignItems: 'flex-end',
  },
  pinLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  pinNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F97316',
  },
  deliveryTypeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  deliveryTypeLeft: {
    flex: 1,
  },
  deliveryTypeLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 2,
  },
  deliveryTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amountBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  mapContainer: {
    flex: 1,
    minHeight: 300,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    backgroundColor: '#eee',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F16122',
    marginRight: 12,
    marginTop: 4,
  },
  deliveryDot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#F16122',
  },
  routeDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#F16122',
    marginLeft: 5,
    marginVertical: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  deliveryAddressText: {
    color: '#F16122',
    fontWeight: '600',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  customerRole: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F16122',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  finishIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeliveryTrackingScreen;