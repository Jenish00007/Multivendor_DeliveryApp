import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../../context/Auth';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors'; // Import the theme object
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import { API_URL } from '../../config/api'

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [updatingAction, setUpdatingAction] = useState(null);
  const [priceSummary, setPriceSummary] = useState({
    totalItems: 0,
    subtotal: 0,
    totalOriginalPrice: 0,
    totalDiscount: 0,
    total: 0,
    currency: 'INR',
    savings: 0
  });
  
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];

  useEffect(() => {
    if (token) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [token]);

  const calculatePriceSummary = (items) => {
    if (!Array.isArray(items)) return;
    console.log('Calculating price summary for items:', items);

    const summary = items.reduce((acc, item) => {
      // Ensure we have valid price values
      const originalPrice = parseFloat(item.originalPrice || item.product?.originalPrice || item.product?.price || 0);
      const discountPrice = parseFloat(item.discountPrice || item.product?.discountPrice || originalPrice);
      const quantity = parseInt(item.quantity || 0);
      
      console.log('Item prices:', {
        itemId: item._id,
        originalPrice,
        discountPrice,
        quantity
      });
      
      // Calculate item totals
      const itemOriginalTotal = originalPrice * quantity;
      const itemDiscountTotal = discountPrice * quantity;
      const itemDiscount = itemOriginalTotal - itemDiscountTotal;
      
      return {
        totalItems: acc.totalItems + quantity,
        subtotal: acc.subtotal + itemDiscountTotal,
        totalOriginalPrice: acc.totalOriginalPrice + itemOriginalTotal,
        totalDiscount: acc.totalDiscount + itemDiscount,
        total: acc.total + itemDiscountTotal,
        currency: 'INR',
        savings: acc.savings + itemDiscount
      };
    }, {
      totalItems: 0,
      subtotal: 0,
      totalOriginalPrice: 0,
      totalDiscount: 0,
      total: 0,
      currency: 'INR',
      savings: 0
    });

    console.log('Final price summary:', summary);
    setPriceSummary(summary);
  };

  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };    

      const response = await fetch(`${API_URL}/cart/all`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      console.log('Cart API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      if (data.success) {
        const cartItems = Array.isArray(data.cartItems) ? data.cartItems : [];
        console.log('Setting cart items:', cartItems);
        setCartItems(cartItems);
        calculatePriceSummary(cartItems);
      } else {
        throw new Error(data.message || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', error.message || 'Failed to fetch cart items');
      setCartItems([]);
      setPriceSummary({
        totalItems: 0,
        subtotal: 0,
        totalOriginalPrice: 0,
        totalDiscount: 0,
        total: 0,
        currency: 'INR',
        savings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCartItem = async (cartItemId) => {
    if (!token || !cartItemId) return;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers: headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete item');
      }

      if (data.success) {
        await fetchCartItems();
        Alert.alert('Success', 'Item removed from cart');
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
      Alert.alert('Error', error.message || 'Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (!token || !cartItemId || newQuantity < 1) return;
    
    setUpdatingItemId(cartItemId);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/cart/update/${cartItemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      if (data.success) {
        await fetchCartItems();
      } else {
        throw new Error(data.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleQuantityChange = (item, change) => {
    if (!item?._id || !item?.quantity) return;
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateCartQuantity(item._id, newQuantity);
    }
  };
  console.log(cartItems)  
  const renderItem = ({ item }) => {
    if (!item?.product) return null;
    console.log('Rendering cart item:', item);

    // Ensure we have valid price values
    const originalPrice = parseFloat(item.originalPrice || item.product?.originalPrice);
    const discountPrice = parseFloat(item.discountPrice || item.product?.discountPrice );
    const quantity = parseInt(item.quantity || 0);

    console.log('Item prices in render:', {
      itemId: item._id,
      originalPrice,
      discountPrice,
      quantity
    });

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProductDetail', { product: item.product })}
        style={[styles.card, { 
          borderColor: currentTheme.borderColor,
          backgroundColor: currentTheme.itemCardColor
        }]}
      >
        {item.product?.images?.[0] && (
          <Image
            source={{ uri: item.product.images[0] }}
            style={styles.image}
          />
        )}
        <View style={styles.info}>
          <Text style={[styles.name, { color: currentTheme.fontMainColor }]}>
            {item.product?.name || 'Unknown Item'}
          </Text>
          <View style={styles.priceContainer}>
            {originalPrice > discountPrice && (
              <Text style={[styles.originalPrice, { color: currentTheme.fontSecondColor }]}>
                ₹{originalPrice.toFixed(2)}
              </Text>
            )}
            <Text style={[styles.price, { color: currentTheme.primary }]}>
              ₹{discountPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              onPress={() => handleQuantityChange(item, -1)}
              style={[styles.quantityButton, { backgroundColor: currentTheme.buttonBackground }]}
            >
              <Text style={[styles.quantityButtonText, { color: currentTheme.buttonText }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: currentTheme.fontMainColor }]}>{quantity}</Text>
            <TouchableOpacity 
              onPress={() => handleQuantityChange(item, 1)}
              style={[styles.quantityButton, { backgroundColor: currentTheme.buttonBackground }]}
            >
              <Text style={[styles.quantityButtonText, { color: currentTheme.buttonText }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Remove Item',
              'Are you sure you want to remove this item from your cart?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel'
                },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => deleteCartItem(item._id)
                }
              ]
            );
          }}
        >
          <FontAwesome name="trash" size={20} color={currentTheme.textErrorColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, 
        { backgroundColor: currentTheme.themeBackground }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
        <Text style={[styles.emptyMessage, { color: currentTheme.fontSecondColor }]}>
          Your cart is empty
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
      <StatusBar 
        backgroundColor="#F16122"
        barStyle="dark-content"
      />
      
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: currentTheme.fontSecondColor }]}>
            Your cart is empty
          </Text>
        }
      />

      <View style={[styles.totalSection, { backgroundColor: currentTheme.itemCardColor }]}>
        <View style={styles.priceSummaryContainer}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: currentTheme.fontMainColor }]}>Total Items:</Text>
            <Text style={[styles.priceValue, { color: currentTheme.fontMainColor }]}>{priceSummary.totalItems}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: currentTheme.fontMainColor }]}>Original Price:</Text>
            <Text style={[styles.priceValue, { color: currentTheme.fontMainColor }]}>₹{priceSummary.totalOriginalPrice.toFixed(2)}</Text>
          </View>

          {priceSummary.totalDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: currentTheme.fontMainColor }]}>Total Discount:</Text>
              <Text style={[styles.priceValue, { color: currentTheme.success || '#388e3c' }]}>-₹{priceSummary.totalDiscount.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: currentTheme.borderColor }]} />

          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: currentTheme.fontMainColor }]}>Total Amount:</Text>
            <Text style={[styles.totalAmount, { color: currentTheme.primary }]}>₹{priceSummary.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.addButton, { 
            backgroundColor: currentTheme.buttonBackground,
            shadowColor: currentTheme.shadowColor
          }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { 
            color: currentTheme.buttonTextPink
          }]}>Add More Items</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.confirmButton, { 
            backgroundColor: currentTheme.buttonBackground,
            shadowColor: currentTheme.shadowColor
          }]} 
          onPress={() => {
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
              Alert.alert('Error', 'Your cart is empty');
              return;
            }
            navigation.navigate('OrderSummary', { 
              cartItems,
              priceSummary,
              totalItems: priceSummary.totalItems,
              subtotal: priceSummary.subtotal,
              totalDiscount: priceSummary.totalDiscount,
              total: priceSummary.total,
              currency: priceSummary.currency,
              savings: priceSummary.savings
            });
          }}
        >
          <Text style={[styles.buttonText, { 
            color: currentTheme.buttonTextPink
          }]}>Confirm Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
    borderRadius: 8,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  info: {
    marginLeft: 15,
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  addButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  deleteButton: {
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  totalSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 10,
  },
  priceSummaryContainer: {
    padding: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CartPage;