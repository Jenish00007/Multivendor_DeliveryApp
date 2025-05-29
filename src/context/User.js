import React, { useState, useEffect, useContext } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useApolloClient, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { v5 as uuidv5 } from 'uuid'
import { v1 as uuidv1 } from 'uuid'
import { profile } from '../apollo/queries'
import { LocationContext } from './Location'
import AuthContext from './Auth'
import analytics from '../utils/analytics'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
const API_URL = 'https://api.qauds.in/api/v2'

const UserContext = React.createContext({})

export const UserProvider = props => {
  const Analytics = analytics()
  const { t } = useTranslation()
  const { token, setToken } = useContext(AuthContext)
  const { location, setLocation } = useContext(LocationContext)
  const [cart, setCart] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [isPickup, setIsPickup] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [dataProfile, setProfile] = useState(null)
  const [formetedProfileData, setFormetedProfileData] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [errorProfile, setErrorProfile] = useState(null)
  const networkStatus='1'

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoadingProfile(false);
        return;
      }
    
     setLoadingProfile(true);
    
      try {
        const response = await fetch(`${API_URL}/user/user-info/68349faa87cd0bb608a5cff8`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-localization': 'en', 
          }
        });

        const data = await response.json();
        console.log("Data",data)
        if (response.ok) {
      
          setProfile(data.user); 
          setFormetedProfileData(data.user)
        } else {
         
          console.log('Error Status:', response.status);  // Log status code for debugging
          console.log('Error Message:', data);  // Log the response body in case of error
          setErrorProfile(data.message || 'Failed to fetch profile');
        }
      } catch (error) {
        // This will catch network errors (e.g., if the device is offline)
        console.log('Network request failed:', error);
        setErrorProfile(error.message || 'Error fetching profile');
      } finally {
        setLoadingProfile(false); // Set loading to false when the fetch process is done
      }
    };
    
    fetchProfileData();
  }, [token]);

  const logout = async () => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('token')
      setToken(null)
      
      // Reset location if needed
      if (location.id) {
        setLocation({
          label: t('selectedLocation'),
          latitude: location.latitude,
          longitude: location.longitude,
          deliveryAddress: location.deliveryAddress
        })
      }

      // Clear any other user-related data
      setProfile(null)
      setFormetedProfileData(null)
      setCart([])

      return true
    } catch (error) {
      console.log('error on logout', error)
      return false
    }
  }

  //add to cart
  const addToCart = async (item) => {
    try {
      if (!token) {
        throw new Error('User not logged in');
      }

      const headers = {
        'moduleId': '1',
        'zoneId': '[1]',
        'latitude': location?.latitude?.toString() || '23.79354466376145',
        'longitude': location?.longitude?.toString() || '90.41166342794895',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // List cart Items first to check if item already exists and check store
      const cartResponse = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/list`, {
        'method': 'GET',
        headers: headers,
      });
      const cartItems = await cartResponse.json();
      
      // Check if product is already in cart
      const isProductInCart = cartItems?.some(cartItem => cartItem.item_id === item.id);
      if (isProductInCart) {
        throw new Error("This product is already in your cart.");
      }

      // Check if cart has items from a different store
      if (cartItems && cartItems.length > 0) {
        const firstItemStoreId = cartItems[0].item.store_id;
        if (firstItemStoreId !== item.store_id) {
          // Show confirmation dialog
          return new Promise((resolve, reject) => {
            Alert.alert(
              "Different Store",
              "Your cart contains items from a different store. Adding this item will remove all items from your current cart. Do you want to continue?",
              [
                {
                  text: "Cancel",
                  onPress: () => resolve({ success: false, message: "Operation cancelled" }),
                  style: "cancel"
                },
                {
                  text: "Yes",
                  onPress: async () => {
                    try {
                      // Delete all existing cart items
                      for (const cartItem of cartItems) {
                        await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/remove-item?cart_id=${cartItem.id}`, {
                          method: 'DELETE',
                          headers: headers
                        });
                      }

                      // Add new item
                      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/add`, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({
                          item_id: item.id,
                          quantity: 1,
                          price: item.price,
                          name: item.name,
                          image: item.image_full_url,
                          model: "Item"
                        }),
                      });

                      const result = await response.text();
                      if (!response.ok) {
                        throw new Error(result.message || "Failed to add product to cart.");
                      }

                      // Update local cart state
                      setCart([item]);
                      resolve({ success: true, message: "Product added to cart successfully!" });
                    } catch (error) {
                      reject(error);
                    }
                  }
                }
              ]
            );
          });
        }
      }

      // If we get here, either cart is empty or item is from same store
      const response = await fetch(`https://6ammart-admin.6amtech.com/api/v1/customer/cart/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          item_id: item.id,
          quantity: 1,
          price: item.price,
          name: item.name,
          image: item.image_full_url,
          model: "Item"
        }),
      });

      const result = await response.text();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add product to cart.");
      }

      // Update local cart state
      const updatedCart = [...cart, item];
      setCart(updatedCart);

      return { success: true, message: "Product added to cart successfully!" };
    } catch (error) {
      console.error('Error in addToCart:', error);
      return { success: false, message: error.message };
    }
  };
    
  
  return (
    <UserContext.Provider
      value={{
        isLoggedIn: !!token && dataProfile && !!dataProfile,
        loadingProfile: loadingProfile,
        errorProfile,
        formetedProfileData,
        logout,
        addToCart,
        cart,
        setCart,
        networkStatus,
        isPickup,
        setIsPickup,
        instructions,
        setInstructions
      }}>
      {props.children}
    </UserContext.Provider>
  )
}
export const useUserContext = () => useContext(UserContext)
export const UserConsumer = UserContext.Consumer
export default UserContext