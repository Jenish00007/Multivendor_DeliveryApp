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
import { API_URL } from '../config/api'

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
  const [userType, setUserType] = useState(null) // 'user' or 'deliveryman'
  const networkStatus='1'

  // Helper function to determine if user is a delivery man
  const isDeliveryMan = () => {
    return userType === 'deliveryman';
  };

  // Helper function to determine if user is a regular user
  const isRegularUser = () => {
    return userType === 'user';
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setLoadingProfile(false);
        return;
      }
    
     setLoadingProfile(true);
    
      try {
        // Fetch delivery man profile
        const response = await fetch(`${API_URL}/deliveryman/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-localization': 'en', 
          }
        });

        const data = await response.json();
        console.log("Delivery Man Data", data);
        
        if (response.ok) {
          setProfile(data.deliveryMan); 
          setFormetedProfileData(data.deliveryMan);
          setUserType('deliveryman');
        } else {
          console.log('Error Status:', response.status);
          console.log('Error Message:', data);
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
      setUserType(null)
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // First check if product is already in cart
      const cartResponse = await fetch(`${API_URL}/cart/all`, {
        method: 'GET',
        headers: headers,
      });

      const cartData = await cartResponse.json();
      
      if (!cartResponse.ok) {
        throw new Error(cartData.message || 'Failed to fetch cart');
      }

      const existingItem = cartData.cartItems?.find(
        cartItem => cartItem.product._id === item._id
      );

      if (existingItem) {
        // Update quantity if item exists
        const updateResponse = await fetch(`${API_URL}/cart/update/${existingItem._id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            quantity: existingItem.quantity + 1,
            originalPrice: item.originalPrice ,
            discountPrice: item.discountPrice 
          })
        });

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
          throw new Error(updateData.message || 'Failed to update cart');
        }

        return { 
          success: true, 
          message: 'Cart updated successfully' 
        };
      }

      // Add new item to cart
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          productId: item._id,
          quantity: 1,
          originalPrice: item.originalPrice,
          discountPrice: item.discountPrice
        })
      });

      const data = await response.json();
      console.log("Data",data)
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add to cart');
      }

      return { 
        success: true, 
        message: 'Product added to cart successfully' 
      };

    } catch (error) {
      console.error('Error in addToCart:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to add to cart' 
      };
    }
  };
    
  
  return (
    <UserContext.Provider
      value={{
        isLoggedIn: !!token && dataProfile && !!dataProfile,
        loadingProfile: loadingProfile,
        errorProfile,
        formetedProfileData,
        userType,
        isDeliveryMan,
        isRegularUser,
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