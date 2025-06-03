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
import { API_URL } from '../../config/api'
import RazorpayCheckout from 'react-native-razorpay';

const OrderSummary = ({ route }) => {
  // Get cart data from navigation params
  const {   
    cartItems,
    priceSummary,
    total,
    subtotal,
    totalDiscount,
    currency
  } = route.params || {};
  
  const { token } = useContext(AuthContext);
  const { cart, clearCart, updateCart } = useUserContext();
  const navigation = useNavigation();
  
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  
  const colorScheme = useColorScheme();
  
  // Initialize with navigation params if available, otherwise use context
  const [cartItemsState, setCartItemsState] = useState(cartItems || (cart?.items || []));
  const [totalAmount, setTotalAmount] = useState(total || 0);
  const [activeSection, setActiveSection] = useState('address');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
    if (cartItems) {
      setCartItemsState(cartItems);
      calculateTotalAmount(cartItems);
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
      setCartItemsState(cart.items);
      
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
    
    // If we have price summary from navigation params, use that
    if (priceSummary) {
      setTotalAmount(priceSummary.total);
      return;
    }
    
    // Otherwise calculate from items
    const total = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  };

  // Listen for cart updates from context
  useEffect(() => {
    if (!cartItems && cart && cart.items) {
      setCartItemsState(cart.items);
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
    setPaymentMethod(method);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewAddress({ ...newAddress, [field]: value });
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      console.log('Fetching Razorpay key from:', `${API_URL}/payment/razorpayapikey`);
      
      // Get Razorpay key from backend
      const keyResponse = await fetch(`${API_URL}/payment/razorpayapikey`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      console.log('Key Response Status:', keyResponse.status);
      console.log('Key Response Headers:', keyResponse.headers);

      const responseText = await keyResponse.text();
      console.log('Key Response Text:', responseText);

      if (!keyResponse.ok) {
        throw new Error(`Failed to get Razorpay key: ${responseText}`);
      }

      let keyData;
      try {
        keyData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!keyData || !keyData.keyId) {
        console.error('Invalid key data:', keyData);
        throw new Error('Invalid Razorpay key received from server');
      }

      console.log('Successfully got Razorpay key');

      // Create order on your backend
      console.log('Creating order with amount:', totalAmount);
      
      const orderResponse = await fetch(`${API_URL}/payment/process`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR'
        })
      });

      console.log('Order Response Status:', orderResponse.status);
      
      const orderResponseText = await orderResponse.text();
      console.log('Order Response Text:', orderResponseText);

      if (!orderResponse.ok) {
        throw new Error(`Failed to create payment order: ${orderResponseText}`);
      }

      let orderData;
      try {
        orderData = JSON.parse(orderResponseText);
      } catch (parseError) {
        console.error('Order JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!orderData.success || !orderData.order || !orderData.order.id) {
        console.error('Invalid order data:', orderData);
        throw new Error(orderData.error || 'Invalid order data received');
      }

      console.log('Successfully created order');

      const options = {
        description: 'Payment for your order',
        image: 'https://your-logo-url.png',
        currency: 'INR',
        key: keyData.keyId,
        amount: totalAmount * 100,
        name: 'Your App Name',
        order_id: orderData.order.id,
        prefill: {
          email: selectedAddress?.email,
          contact: selectedAddress?.phone,
          name: selectedAddress?.name
        },
        theme: { color: '#F16122' }
      };

      console.log('Opening Razorpay with options:', { ...options, key: '***' });

      const paymentData = await RazorpayCheckout.open(options);
      
      if (!paymentData || !paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
        console.error('Invalid payment data:', paymentData);
        throw new Error('Invalid payment response from Razorpay');
      }

      console.log('Payment successful, verifying...');

      // Verify payment on your backend
      const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature
        })
      });

      console.log('Verify Response Status:', verifyResponse.status);
      
      const verifyResponseText = await verifyResponse.text();
      console.log('Verify Response Text:', verifyResponseText);

      if (!verifyResponse.ok) {
        throw new Error(`Payment verification failed: ${verifyResponseText}`);
      }

      let verifyData;
      try {
        verifyData = JSON.parse(verifyResponseText);
      } catch (parseError) {
        console.error('Verify JSON Parse Error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      if (!verifyData.success) {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

      console.log('Payment verified successfully');

      // If payment is successful, proceed with order placement
      handlePlaceOrder('razorpay', paymentData.razorpay_payment_id);
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async (paymentType = 'cash_on_delivery', paymentId = null) => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    try {
      setIsLoading(true);

      const orderData = {
        cart: cartItemsState.map(item => ({
          _id: item.product?._id || item._id,
          name: item.product?.name || item.name,
          price: item.product?.discountPrice || item.price,
          qty: item.quantity,
          shopId: item.product?.shopId || item.shopId,
          shopName: item.product?.shop?.name || item.shopName || "Shop not found",
          images: item.product?.images || item.images,
          totalPrice: (item.product?.discountPrice || item.price) * item.quantity,
          productDetails: {
            name: item.product?.name || item.name,
            description: item.product?.description || "",
            category: item.product?.category?.name || "",
            subcategory: item.product?.subcategory?.name || "",
            tags: item.product?.tags || "",
            originalPrice: item.product?.originalPrice || item.price,
            discountPrice: item.product?.discountPrice || item.price,
            stock: item.product?.stock || 0
          }
        })),
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          locality: selectedAddress.locality,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          addressType: selectedAddress.addressType
        },
        user: {
          _id: token ? token.split('.')[1] : null,
          name: selectedAddress.name,
          email: selectedAddress.email || '',
          phone: selectedAddress.phone
        },
        totalPrice: totalAmount,
        paymentInfo: {
          type: paymentType,
          status: paymentType === 'cash_on_delivery' ? 'Pending' : 'Succeeded',
          paymentId: paymentId
        }
      };
      console.log(orderData)
      const response = await fetch(`${API_URL}/order/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderData),
      });
      
      let responseData;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        throw new Error('Server returned non-JSON response. Please try again.');
      }
      
      if (response.ok) {
        if (!cartItems && clearCart) {
          clearCart();
        }
        
        const storedOrders = await AsyncStorage.getItem('orders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        orders.push(responseData.orders[0]); // Store the first order from response
        await AsyncStorage.setItem('orders', JSON.stringify(orders));
        
        navigation.navigate('OrderConfirmation', { order: responseData.orders[0] });
      } else {
        console.error('API Error:', responseData);
        Alert.alert('Error', responseData.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
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
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment();
      } else {
        handlePlaceOrder();
      }
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
          <View style={[styles.section, { backgroundColor: currentTheme.itemCardColor }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
              Select Payment Method
            </Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'cash_on_delivery' && styles.selectedPayment,
                { borderColor: currentTheme.borderColor }
              ]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <Text style={[styles.paymentText, { color: currentTheme.fontMainColor }]}>
                Cash on Delivery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'razorpay' && styles.selectedPayment,
                { borderColor: currentTheme.borderColor }
              ]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <Text style={[styles.paymentText, { color: currentTheme.fontMainColor }]}>
                Pay with Razorpay
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Order Summary */}
        <View style={[styles.orderSummary, { backgroundColor: currentTheme.itemCardColor }]}>
          <Text style={[styles.summaryTitle, { color: currentTheme.fontMainColor }]}>Order Summary</Text>
          
          {/* Cart Items */}
          {cartItemsState.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={[styles.itemName, { color: currentTheme.fontMainColor }]}>
                  {item.product?.name || item.name || 'Unknown Item'}
                </Text>
                <Text style={[styles.itemQuantity, { color: currentTheme.fontSecondColor }]}>
                  Quantity: {item.quantity}
                </Text>
                <View style={styles.itemPriceDetails}>
                  <Text style={[styles.priceDetail, { color: currentTheme.fontSecondColor }]}>
                    Unit Price: ₹{item.priceDetails?.unitPrice?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={[styles.priceDetail, { color: currentTheme.fontSecondColor }]}>
                    Original Price: ₹{item.priceDetails?.originalUnitPrice?.toFixed(2) || '0.00'}
                  </Text>
                  {item.priceDetails?.discountAmount > 0 && (
                    <Text style={[styles.priceDetail, { color: currentTheme.success || '#388e3c' }]}>
                      Discount: -₹{item.priceDetails?.discountAmount?.toFixed(2) || '0.00'}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.itemPrice, { color: currentTheme.primary }]}>
                ₹{item.priceDetails?.totalPrice?.toFixed(2) || '0.00'}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />
          
          <View style={styles.summaryRow}>
            <Text style={{ color: currentTheme.fontSecondColor }}>Price ({cartItemsState.length} items)</Text>
            <Text style={{ color: currentTheme.fontMainColor }}>₹{subtotal?.toFixed(2) || totalAmount.toFixed(2)}</Text>
          </View>
          {totalDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={{ color: currentTheme.fontSecondColor }}>Discount</Text>
              <Text style={[styles.discount, { color: currentTheme.success || '#388e3c' }]}>
                -₹{totalDiscount?.toFixed(2) || '0.00'}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={{ color: currentTheme.fontSecondColor }}>Delivery Charges</Text>
            <Text style={[styles.freeDelivery, { color: currentTheme.success || '#388e3c' }]}>FREE</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalText, { color: currentTheme.fontMainColor }]}>Total Amount</Text>
            <Text style={[styles.totalText, { color: currentTheme.primary }]}>₹{total?.toFixed(2) || totalAmount.toFixed(2)}</Text>
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
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPriceDetails: {
    marginTop: 4,
  },
  priceDetail: {
    fontSize: 12,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  paymentOption: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#F16122',
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // ... rest of existing styles ...
});