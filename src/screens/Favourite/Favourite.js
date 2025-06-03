import { useFocusEffect } from '@react-navigation/native'
import React, { useContext, useCallback, useState } from 'react'
import {
  FlatList,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// Components
import Products from '../../components/Products/Products'
import Spinner from '../../components/Spinner/Spinner'
import ErrorView from '../../components/ErrorView/ErrorView'
import EmptyView from '../../components/EmptyView/EmptyView'

import { API_URL } from '../../config/api'

// Context
import { LocationContext } from '../../context/Location'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import AuthContext from '../../context/Auth'

// Utils
import { theme } from '../../utils/themeColors'
import { useTranslation } from 'react-i18next'

const { width } = Dimensions.get('window')

function Favourite() {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { location } = useContext(LocationContext)
  const { token } = useContext(AuthContext)
  
  // State
  const [favoriteData, setFavoriteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Network-only fetch function
  const fetchFavouriteData = useCallback(async () => {
    try {
      setLoading(true)

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }
      
      const response = await fetch(`${API_URL}/favorites/all`, {
        method: 'GET',
        headers: headers,
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`Failed to fetch favourite data: ${response.status}`);
      }

      const data = await response.json()
      if (!data) {
        throw new Error('Empty response received');
      }
      
      // Ensure we have valid data before setting state
      const validFavorites = Array.isArray(data.favorites) ? data.favorites : []
      setFavoriteData(validFavorites)
      setError(null)
    } catch (err) {
      console.log('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [location, token])

  const handleRemoveFromWishlist = async (itemId) => {
    if (!itemId) {
      console.log('Invalid item ID')
      return
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      }

      const response = await fetch(`${API_URL}/favorites/remove/${itemId}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          item_id: itemId
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Remove from wishlist error response:', errorText);
        throw new Error('Failed to remove from favorites');
      }

      // Refresh the favorites list
      await fetchFavouriteData()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      Alert.alert(
        'Error',
        'Failed to remove from favorites. Please try again.'
      )
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchFavouriteData()
  }

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFavouriteData()
    }, [fetchFavouriteData])
  )

  if (loading && !refreshing) {
    return (
      <Spinner
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    )
  }
  
  if (error) return <ErrorView />
  
  return (
    <SafeAreaView edges={['bottom']} style={[styles.flex, { backgroundColor: currentTheme.themeBackground }]}>
      <View style={[styles.flex, { backgroundColor: currentTheme.themeBackground }]}>
        {favoriteData.length > 0 ? (
          <FlatList
            key={`favorites-grid`}
            data={favoriteData}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ 
              justifyContent: 'space-between',
              paddingHorizontal: 10,
              marginBottom: 10
            }}
            contentContainerStyle={{ 
              padding: 10,
              paddingBottom: 20,
              flexGrow: 1
            }}
            renderItem={({ item }) => {
              if (!item || !item.product) {
                console.log('Invalid item in favorites:', item)
                return null
              }
              
              return (
                <View style={{ 
                  width: '55%',
                  marginBottom: 10
                }}>
                  <Products 
                    item={item.product} 
                    onRemoveFromWishlist={() => handleRemoveFromWishlist(item._id)}
                    isFavorite={true}
                    theme={currentTheme}
                    horizontal={false}
                  />
                </View>
              )
            }}
            keyExtractor={(item) => item?._id?.toString() || Math.random().toString()}
            ListEmptyComponent={
              <View style={{ 
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                minHeight: 200
              }}>
                <Text style={{
                  fontSize: 16,
                  color: currentTheme.fontSecondColor,
                  textAlign: 'center'
                }}>No favorite items found</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyView
              title={'noFavoriteItems'}
              description={'emptyFavItemsDesc'}
              buttonText={'emptyFavBtn'}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16
  }
});

export default Favourite