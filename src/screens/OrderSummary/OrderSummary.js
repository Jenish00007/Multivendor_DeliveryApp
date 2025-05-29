import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  useColorScheme,
  StatusBar,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUserContext } from './../../context/User';
import OrderSummaryStyles from './OrderSummaryStyles';
import PaymentMethod from '../../components/Payment/PaymentMethod';
import AuthContext from '../../context/Auth';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';

const OrderSummary = ({ route }) => {
  // Get cart data from navigation params
  const { cartItems: navigationCartItems } = route.params || {};
  
  const { token } = useContext(AuthContext);
  const { cart, clearCart, updateCart } = useUserContext();
  const navigation = useNavigation();
  
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  
  const colorScheme = useColorScheme();
  
  // Initialize with navigation params if available, otherwise use context
  const [cartItems, setCartItems] = useState(navigationCartItems || (cart?.items || []));
  const [totalAmount, setTotalAmount] = useState(0);
  const [activeSection, setActiveSection] = useState('address');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    addressType: 'Home',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Load cart items and addresses from context/navigation and storage
  useEffect(() => {
    // If cart items were passed from navigation, use those
    if (navigationCartItems) {
      setCartItems(navigationCartItems);
      calculateTotalAmount(navigationCartItems);
    } else {
      // Otherwise fetch from context
      refreshCartData();
    }
    
    // Load saved addresses
    loadAddresses();
  }, []);

  // Function to refresh cart data from context
  const refreshCartData = () => {
    if (cart && cart.items) {
      setCartItems(cart.items);
      
      // Calculate total amount
      calculateTotalAmount(cart.items);
    }
  };

  // Calculate total amount from cart items
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) {
      setTotalAmount(0);
      return;
    }
    
    const total = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  };

  // Listen for cart updates from context
  useEffect(() => {
    if (!navigationCartItems && cart && cart.items) {
      setCartItems(cart.items);
      calculateTotalAmount(cart.items);
    }
  }, [cart]);

  // Load addresses from AsyncStorage
  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('addresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        // If there's at least one address, select the first one by default
        if (parsedAddresses.length > 0) {
          setSelectedAddress(parsedAddresses[0]);
        }
      }
    } catch (error) {
      console.error('Error loading addresses', error);
    }
  };

  // Save a new address
  const saveAddress = async () => {
    // Validate the form
    if (!newAddress.name || !newAddress.phone || !newAddress.pincode || 
        !newAddress.address || !newAddress.city || !newAddress.state) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const address = { ...newAddress, id: Date.now().toString() };
      const updatedAddresses = [...addresses, address];
      
      await AsyncStorage.setItem('addresses', JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      setSelectedAddress(address);
      setShowAddressForm(false);
      
      // Reset form
      setNewAddress({
        name: '',
        phone: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        addressType: 'Home',
      });
      
      Alert.alert('Success', 'Address saved successfully');
    } catch (error) {
      console.error('Error saving address', error);
      Alert.alert('Error', 'Failed to save address');
    }
  };

  // Handle address selection
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
  };

  // Handle payment method selection
  const handleSelectPayment = (method) => {
    setPaymentMethod("digital_payment");
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewAddress({ ...newAddress, [field]: value });
  };

  // Handle checkout completion
  const handlePlaceOrder = async () => {
    if (!navigationCartItems) {
      refreshCartData();
    }
    
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    
    try {
      setIsLoading(true);
      const order = {
        id: Date.now().toString(),
        items: cartItems,
        totalAmount,
        address: selectedAddress,
        paymentMethod,
        date: new Date().toISOString(),
        status: 'Placed'
      };

      const headers = {
        'zoneId': '[3,1]',
        "moduleId": '1',
        'X-localization': "en",
        'Connection': "keep-alive",
        'Authorization': token ? `Bearer ${token}` : '',
      }
      const orderDeatil = `order_amount=${totalAmount}&payment_method=${paymentMethod}&order_type=delivery&store_id=${cartItems[0].item.store_id}&distance=9693.34`
      const cust_Address =`address=${selectedAddress.address}&latitude=23.79354466376145&longitude=90.41166342794895` 
      const cust_Detail=`contact_person_name=${selectedAddress.name}&contact_person_number=${selectedAddress.phone}&contact_person_email=${selectedAddress.email}`

      const uri=`https://6ammart-admin.6amtech.com/api/v1/customer/order/place?${orderDeatil}&${cust_Address}&${cust_Detail}`
      
      const response = await fetch(uri, {
        method: 'POST',
        headers: headers
      });
      
      const responseData = await response.json();
      if (response.ok) {
        if (!navigationCartItems && clearCart) {
          clearCart();
        }
        
        const storedOrders = await AsyncStorage.getItem('orders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        orders.push(order);
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        navigation.navigate('OrderConfirmation', { order });
      } else {
        console.error('API Error:', responseData);
        Alert.alert('Error', responseData.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order', error);
      Alert.alert('Error', 'Failed to place order. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress to next section
  const proceedToNext = () => {
    if (activeSection === 'address') {
      if (!selectedAddress) {
        Alert.alert('Error', 'Please select or add a delivery address');
        return;
      }
      setActiveSection('payment');
    } else if (activeSection === 'payment') {
      handlePlaceOrder();
    }
  };

  // Go back to previous section
  const goBack = () => {
    if (activeSection === 'payment') {
      setActiveSection('address');
    } else {
      navigation.goBack();
    }
  };

  // Import styles
  const styles = OrderSummaryStyles;

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar 
        backgroundColor="#F16122"
        barStyle="dark-content"
      />
      
      {/* Checkout Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: currentTheme.itemCardColor }]}>
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, { backgroundColor: currentTheme.primary }]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={[styles.stepText, { color: currentTheme.primary }]}>Delivery Address</Text>
        </View>
        <View style={[styles.progressLine, activeSection === 'payment' || activeSection === 'summary' ? { backgroundColor: currentTheme.primary } : { backgroundColor: currentTheme.borderColor }]} />
        <View style={styles.progressStep}>
          <View style={[styles.stepCircle, activeSection === 'payment' || activeSection === 'summary' ? { backgroundColor: currentTheme.primary } : { backgroundColor: currentTheme.borderColor }]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={[styles.stepText, activeSection === 'payment' || activeSection === 'summary' ? { color: currentTheme.primary } : { color: currentTheme.fontSecondColor }]}>Payment Method</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Address Section */}
        {activeSection === 'address' && (
          <View style={[styles.section, { backgroundColor: currentTheme.itemCardColor }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>Select Delivery Address</Text>
            
            {/* Address List */}
            {addresses.map((address) => (
              <TouchableOpacity 
                key={address.id} 
                style={[
                  styles.addressCard,
                  { borderColor: currentTheme.borderColor },
                  selectedAddress?.id === address.id && { borderColor: currentTheme.primary, backgroundColor: currentTheme.color8 }
                ]}
                onPress={() => handleSelectAddress(address)}
              >
                <View style={[styles.addressTypeContainer, { backgroundColor: currentTheme.color8 }]}>
                  <Text style={[styles.addressType, { color: currentTheme.fontSecondColor }]}>{address.addressType}</Text>
                </View>
                <Text style={[styles.addressName, { color: currentTheme.fontMainColor }]}>{address.name}</Text>
                <Text style={[styles.addressDetails, { color: currentTheme.fontSecondColor }]}>
                  {address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                </Text>
                <Text style={[styles.addressPhone, { color: currentTheme.fontSecondColor }]}>Phone: {address.phone}</Text>
                
                {selectedAddress?.id === address.id && (
                  <View style={styles.selectedCheckmark}>
                    <Icon name="check-circle" size={24} color={currentTheme.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            {/* Add New Address Button */}
            {!showAddressForm ? (
              <TouchableOpacity 
                style={[styles.addAddressButton, { borderColor: currentTheme.primary }]} 
                onPress={() => setShowAddressForm(true)}
              >
                <Icon name="add" size={24} color={currentTheme.primary} />
                <Text style={[styles.addAddressText, { color: currentTheme.primary }]}>Add New Address</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addressForm, { backgroundColor: currentTheme.color8 }]}>
                <Text style={[styles.formTitle, { color: currentTheme.fontMainColor }]}>Add New Address</Text>
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="Full Name *"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={newAddress.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="Phone Number *"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    keyboardType="phone-pad"
                    value={newAddress.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                  />
                </View>
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="Pincode *"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    keyboardType="number-pad"
                    value={newAddress.pincode}
                    onChangeText={(text) => handleInputChange('pincode', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="Locality"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={newAddress.locality}
                    onChangeText={(text) => handleInputChange('locality', text)}
                  />
                </View>
                
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: currentTheme.themeBackground, 
                    color: currentTheme.fontMainColor,
                    borderColor: currentTheme.borderColor 
                  }]}
                  placeholder="Address (House No, Building, Street, Area) *"
                  placeholderTextColor={currentTheme.fontSecondColor}
                  multiline
                  numberOfLines={3}
                  value={newAddress.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                />
                
                <View style={styles.formRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="City/Town *"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={newAddress.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { 
                      backgroundColor: currentTheme.themeBackground, 
                      color: currentTheme.fontMainColor,
                      borderColor: currentTheme.borderColor 
                    }]}
                    placeholder="State *"
                    placeholderTextColor={currentTheme.fontSecondColor}
                    value={newAddress.state}
                    onChangeText={(text) => handleInputChange('state', text)}
                  />
                </View>
                
                <View style={styles.addressTypeSelector}>
                  <Text style={[styles.addressTypeLabel, { color: currentTheme.fontSecondColor }]}>Address Type:</Text>
                  <View style={styles.addressTypeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.addressTypeOption,
                        { borderColor: currentTheme.borderColor },
                        newAddress.addressType === 'Home' && { 
                          borderColor: currentTheme.primary, 
                          backgroundColor: currentTheme.color8 
                        }
                      ]}
                      onPress={() => handleInputChange('addressType', 'Home')}
                    >
                      <Text style={[
                        newAddress.addressType === 'Home' 
                          ? { color: currentTheme.primary, fontWeight: 'bold' } 
                          : { color: currentTheme.fontSecondColor }
                      ]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.addressTypeOption,
                        { borderColor: currentTheme.borderColor },
                        newAddress.addressType === 'Work' && { 
                          borderColor: currentTheme.primary, 
                          backgroundColor: currentTheme.color8 
                        }
                      ]}
                      onPress={() => handleInputChange('addressType', 'Work')}
                    >
                      <Text style={[
                        newAddress.addressType === 'Work' 
                          ? { color: currentTheme.primary, fontWeight: 'bold' } 
                          : { color: currentTheme.fontSecondColor }
                      ]}>Work</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setShowAddressForm(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: currentTheme.fontSecondColor }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: currentTheme.primary }]} 
                    onPress={saveAddress}
                  >
                    <Text style={styles.saveButtonText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* Payment Method Section - Now using the PaymentMethod component */}
        {activeSection === 'payment' && (
          <PaymentMethod
            selectedMethod={paymentMethod}
            onSelectMethod={handleSelectPayment}
            theme={currentTheme} // Pass the theme to the PaymentMethod component
          />
        )}
        
        {/* Order Summary */}
        <View style={[styles.orderSummary, { backgroundColor: currentTheme.itemCardColor }]}>
          <Text style={[styles.summaryTitle, { color: currentTheme.fontMainColor }]}>Order Summary</Text>
          
          {/* Cart Items */}
          {cartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={[styles.itemName, { color: currentTheme.fontMainColor }]}>
                  {item.item ? item.item.name : 'Unknown Item'}
                </Text>
                <Text style={[styles.itemQuantity, { color: currentTheme.fontSecondColor }]}>
                  Quantity: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: currentTheme.primary }]}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />
          
          <View style={styles.summaryRow}>
            <Text style={{ color: currentTheme.fontSecondColor }}>Price ({cartItems.length} items)</Text>
            <Text style={{ color: currentTheme.fontMainColor }}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={{ color: currentTheme.fontSecondColor }}>Delivery Charges</Text>
            <Text style={[styles.freeDelivery, { color: currentTheme.success || '#388e3c' }]}>FREE</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalText, { color: currentTheme.fontMainColor }]}>Total Amount</Text>
            <Text style={[styles.totalText, { color: currentTheme.primary }]}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { 
        backgroundColor: currentTheme.itemCardColor,
        borderTopColor: currentTheme.borderColor 
      }]}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, { color: currentTheme.fontMainColor }]}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.proceedButton, 
            { backgroundColor: currentTheme.buttonBackground },
            isLoading && { opacity: 0.7 }
          ]} 
          onPress={proceedToNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={currentTheme.buttonText} />
          ) : (
            <Text style={[styles.proceedButtonText, { color: currentTheme.buttonText }]}>
              {activeSection === 'address' ? 'Continue' : 'Place Order'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderSummary;

const styles = StyleSheet.create({
  // ... existing styles ...
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  // ... rest of existing styles ...
});