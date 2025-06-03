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
  TextInput,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const OrderDetailsScreen = ({ navigation }) => {
  const [additionalNote, setAdditionalNote] = useState('Lorem ipsum dolor sit amet consectetur adipiscing elit, sed diam non.');

  const orderData = {
    restaurant: {
      name: "Mc Donald's",
      cuisine: "American cuisine, fast food",
      phone: "Call",
      direction: "Direction"
    },
    customer: {
      name: "User Name",
      address: "745, ogden avenue, New York, US",
      phone: "Call",
      direction: "Direction"
    },
    items: [
      {
        id: 1,
        name: "Item Name",
        price: "$5.55",
        quantity: 2,
        addons: "Addons: Cheese + Ketchup",
        size: "Size: L"
      },
      {
        id: 2,
        name: "Item Name",
        price: "$5.55",
        quantity: 2,
        addons: "",
        size: ""
      }
    ],
    totalItems: 2
  };

  const handleCall = (type) => {
    console.log(`Calling ${type}`);
  };

  const handleDirection = (type) => {
    console.log(`Getting direction to ${type}`);
  };

  const handleSwipeConfirmation = () => {
    console.log('Order confirmed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Restaurant Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.logoContainer}>
                <View style={styles.mcdonaldsLogo}>
                  <Text style={styles.logoText}>M</Text>
                </View>
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{orderData.restaurant.name}</Text>
                <Text style={styles.detailSubtext}>{orderData.restaurant.cuisine}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCall('restaurant')}
              >
                <Text style={styles.callIcon}>📞</Text>
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDirection('restaurant')}
              >
                <Text style={styles.directionIcon}>📍</Text>
                <Text style={styles.actionText}>Direction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Customer Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Contact Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>U</Text>
                </View>
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{orderData.customer.name}</Text>
                <Text style={styles.detailSubtext}>{orderData.customer.address}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCall('customer')}
              >
                <Text style={styles.callIcon}>📞</Text>
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDirection('customer')}
              >
                <Text style={styles.directionIcon}>📍</Text>
                <Text style={styles.actionText}>Direction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items: {orderData.totalItems}</Text>
            <View style={styles.codBadge}>
              <Text style={styles.codText}>COD</Text>
            </View>
          </View>

          {orderData.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.foodImage}>
                <Text style={styles.foodEmoji}>🍔</Text>
              </View>
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
                {item.addons && <Text style={styles.itemAddons}>{item.addons}</Text>}
                {item.size && <Text style={styles.itemSize}>{item.size}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Note</Text>
          <View style={styles.noteContainer}>
            <TextInput
              style={styles.noteInput}
              value={additionalNote}
              onChangeText={setAdditionalNote}
              multiline={true}
              placeholder="Add your note here..."
            />
          </View>
        </View>

        {/* Confirmation Button */}
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleSwipeConfirmation}
        >
          <Text style={styles.confirmIcon}>➤ ➤ ➤</Text>
          <Text style={styles.confirmText}>Click to Confirmation</Text>
        </TouchableOpacity>
      </ScrollView>

 
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
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callIcon: {
    fontSize: 16,
    color: '#10B981',
  },
  directionIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  actionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  foodImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodEmoji: {
    fontSize: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemAddons: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 16,
  },
  noteInput: {
    fontSize: 14,
    color: '#6B7280',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
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

export default OrderDetailsScreen;