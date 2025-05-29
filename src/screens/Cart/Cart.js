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

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [updatingAction, setUpdatingAction] = useState(null); // 'increment' or 'decrement'
  
  const navigation = useNavigation();
  const { token } = useContext(AuthContext);
  
  // Get the current color scheme (system preferenFce)

 const themeContext = useContext(ThemeContext)
 const currentTheme = theme[themeContext.ThemeValue]
  // Use the Dark theme if system preference is dark, otherwise use Pink theme
 // const currentTheme = colorScheme === 'dark' ? theme.Dark : theme.Pink;

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const headers = {
        'moduleId': '1',
        'Authorization': `Bearer ${token}`,
        'zoneId': '[3,1]',
        'X-localization': 'en',
        'latitude': '23.793544663762145',
        'longitude': '90.41166342794895'
      };    
      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/list`, {
        'method': 'GET',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      console.log('Cart data received:', data);

      setCartItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Failed to fetch cart items');
      setLoading(false);
    }
  };

  const deleteCartItem = async (cartId) => {
    try {
      const headers = {
        'moduleId': '1',
        'Content-Type': 'application/json; charset=UTF-8',
        'zoneId': '[3,1]',
        'X-localization': 'en',
        'latitude': '23.793544663762145',
        'longitude': '90.41166342794895',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/remove-item?cart_id=${cartId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      // Refresh cart items after successful deletion
      await fetchCartItems();
      Alert.alert('Success', 'Item removed from cart');
    } catch (error) {
      console.error('Error deleting cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (cartId, newQuantity, action) => {
    setUpdatingItemId(cartId);
    setUpdatingAction(action);
    try {
      const headers = {
        'moduleId': '1',
        'Content-Type': 'application/json; charset=UTF-8',
        'zoneId': '[3,1]',
        'X-localization': 'en',
        'latitude': '23.793544663762145',
        'longitude': '90.41166342794895',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/update`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          cart_id: cartId,
          price: cartItems.find(item => item.id === cartId)?.price || 0,
          quantity: newQuantity
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to update quantity');
      }

      // Refresh cart items after successful update
      await fetchCartItems();
      Alert.alert('Success', 'Quantity updated successfully');
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      Alert.alert('Error', error.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
      setUpdatingAction(null);
    }
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0) {
      updateCartQuantity(item.id, newQuantity, change > 0 ? 'increment' : 'decrement');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ProductDetail', { product: item.item })}
      style={[styles.card, { 
        borderColor: currentTheme.borderColor,
        backgroundColor: currentTheme.itemCardColor
      }]}
    >
      {item.item && item.item.image && (
        <Image
          source={{ uri: `https://6ammart-admin.6amtech.com/storage/app/public/product/${item.item.image}` }}
          style={styles.image}
        />
      )}
      <View style={styles.info}>
        <Text style={[styles.name, { color: currentTheme.fontMainColor }]}>
          {item.item ? item.item.name : 'Unknown Item'}
        </Text>
        <Text style={[styles.price, { color: currentTheme.primary }]}>
          ₹{item.price}
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleQuantityChange(item, -1)}
            disabled={updatingItemId === item.id}
          >
            {updatingItemId === item.id && updatingAction === 'decrement' ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.quantityButtonText}>-</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.quantity, { color: currentTheme.fontMainColor }]}>
            {item.quantity}
          </Text>
          <TouchableOpacity 
            style={[styles.quantityButton, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleQuantityChange(item, 1)}
            disabled={updatingItemId === item.id}
          >
            {updatingItemId === item.id && updatingAction === 'increment' ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text style={styles.quantityButtonText}>+</Text>
            )}
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
                onPress: () => deleteCartItem(item.id)
              }
            ]
          );
        }}
      >
        <FontAwesome name="trash" size={20} color={currentTheme.textErrorColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
        keyExtractor={(item, index) => `${item.id || index}`}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: currentTheme.fontSecondColor }]}>
            Your cart is empty
          </Text>
        }
      />

      {/* Total Price Section */}
      <View style={[styles.totalSection, { backgroundColor: currentTheme.itemCardColor }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: currentTheme.fontMainColor }]}>Total Amount:</Text>
          <Text style={[styles.totalAmount, { color: currentTheme.primary }]}>₹{calculateTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Button Section */}
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
            try {
              if (!cartItems || cartItems.length === 0) {
                Alert.alert('Error', 'Your cart is empty');
                return;
              }
              navigation.navigate('OrderSummary', { 
                cartItems: Array.isArray(cartItems) ? cartItems : []
              });
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Unable to proceed to order summary');
            }
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
  price: {
    marginVertical: 5,
    fontWeight: '600'
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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