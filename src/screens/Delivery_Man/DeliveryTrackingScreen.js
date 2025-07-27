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
import { useAppBranding } from '../../utils/translationHelper';

const { width, height } = Dimensions.get('window');

const DeliveryTrackingScreen = () => {
  const [status, setStatus] = useState('Delivering');
  const branding = useAppBranding();

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
    <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={branding.primaryColor} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: branding.backgroundColor }]}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: branding.textColor }]}>Order {orderData.orderNumber}</Text>
          <Text style={[styles.transactionNo, { color: branding.textColor }]}>Transaction no {orderData.transactionNo}</Text>
        </View>
        <View style={styles.deliveryPin}>
          <Text style={[styles.pinLabel, { color: branding.textColor }]}>Delivery Pin:</Text>
          <Text style={[styles.pinNumber, { color: branding.primaryColor }]}>{orderData.deliveryPin}</Text>
        </View>
      </View>

      {/* Delivery Type Bar */}
      <View style={[styles.deliveryTypeBar, { backgroundColor: branding.primaryColor }]}>
        <View style={styles.deliveryTypeLeft}>
          <Text style={[styles.deliveryTypeLabel, { color: branding.whiteColorText }]}>Delivery Type</Text>
          <Text style={[styles.deliveryTypeValue, { color: branding.whiteColorText }]}>{orderData.deliveryType}</Text>
        </View>
        <View style={[styles.amountBadge, { backgroundColor: branding.whiteColorText }]}>
          <Text style={[styles.amountText, { color: branding.primaryColor }]}>{orderData.amount}</Text>
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
      <View style={[styles.bottomSheet, { backgroundColor: branding.backgroundColor }]}>
        {/* Address Information */}
        <View style={styles.addressSection}>
          <View style={styles.addressItem}>
            <View style={[styles.addressDot, { backgroundColor: branding.primaryColor }]} />
            <View style={styles.addressContent}>
              <Text style={[styles.addressLabel, { color: branding.textColor }]}>Pickup from</Text>
              <Text style={[styles.addressText, { color: branding.textColor }]}>{orderData.pickupAddress}</Text>
            </View>
          </View>
          
          <View style={[styles.routeDivider, { backgroundColor: branding.primaryColor }]} />
          
          <View style={styles.addressItem}>
            <View style={[styles.addressDot, styles.deliveryDot, { borderColor: branding.primaryColor }]} />
            <View style={styles.addressContent}>
              <Text style={[styles.addressLabel, { color: branding.textColor }]}>Delivery to</Text>
              <Text style={[styles.addressText, styles.deliveryAddressText, { color: branding.primaryColor }]}>{orderData.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={[styles.customerSection, { borderColor: branding.secondaryBackground }]}>
          <View style={styles.customerInfo}>
            <View style={[styles.customerAvatar, { backgroundColor: branding.primaryColor }]}>
              <Text style={[styles.avatarText, { color: branding.whiteColorText }]}>D</Text>
            </View>
            <View style={styles.customerDetails}>
              <Text style={[styles.customerName, { color: branding.textColor }]}>{orderData.customer.name}</Text>
              <Text style={[styles.customerRole, { color: branding.textColor }]}>{orderData.customer.role}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.callButton, { backgroundColor: branding.secondaryBackground }]} onPress={handleCall}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Status and Action */}
        <View style={styles.actionSection}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusLabel, { color: branding.textColor }]}>Status</Text>
            <Text style={[styles.statusValue, { color: branding.textColor }]}>{status}</Text>
          </View>
          <TouchableOpacity style={[styles.finishButton, { backgroundColor: branding.primaryColor }]} onPress={handleFinish}>
            <Text style={[styles.finishIcon, { color: branding.whiteColorText }]}>✓</Text>
            <Text style={[styles.finishText, { color: branding.whiteColorText }]}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionNo: {
    fontSize: 12,
  },
  deliveryPin: {
    alignItems: 'flex-end',
  },
  pinLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  pinNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  deliveryTypeBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  deliveryTypeLeft: {
    flex: 1,
  },
  deliveryTypeLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
  deliveryTypeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginRight: 12,
    marginTop: 4,
  },
  deliveryDot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
  routeDivider: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginVertical: 8,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryAddressText: {
    fontWeight: '600',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerRole: {
    fontSize: 12,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  finishIcon: {
    fontSize: 16,
  },
  finishText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeliveryTrackingScreen;