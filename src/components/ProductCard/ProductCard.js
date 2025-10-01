// components/ProductCard.js
import React, { useContext, useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AddToFavourites from '../Favourites/AddtoFavourites';
import { LocationContext } from '../../context/Location';
import AuthContext from '../../context/Auth';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../../context/User';
// Assuming styles are defined here
export const ProductCard = ({ item }) => {
  const { isLoggedIn, addToCart } = useContext(UserContext);
  const { location } = useContext(LocationContext);
  const { token } = useContext(AuthContext);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
 
  // Function to limit the product name to 10 characters
  const getShortenedName = (name) => {
    if (name.length > 10) {
      return name.slice(0, 17) + '...';
    }
    return name;
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    // Check if product is in stock
    if (item?.stock <= 0) {
      Alert.alert(
        'Out of Stock',
        'This item is currently not available.',
        [{ text: 'OK', style: 'cancel' }],
        { cancelable: true }
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await addToCart(item);
      if (result.success) {
        Alert.alert("Success", result.message);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "An error occurred while adding to cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validate image URI
  const imageUri = typeof item?.image_full_url === 'string' && item.image_full_url.trim() 
    ? item.image_full_url 
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.itemWrapper}>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })} activeOpacity={0.8}>
          <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.cardImageBG}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cardImageBG} />
              )}
              <View style={styles.favoritePosition}>
                <AddToFavourites product={item}/>
              </View>
            </View>
            <Text style={styles.cardTitle}>{getShortenedName(item.name)}</Text>
            <View style={styles.cardFooterRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.cardPriceCurrency}>₹</Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleAddToCart}
                style={[styles.addButton, { backgroundColor: '#F16122' }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Icon name="add" size={20} color="#000000" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Define the styles here
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  itemWrapper: {
    flex: 1,
    marginBottom: 10,
  },
  itemContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: 11,
    },
    elevation: 24,
    marginBottom: 10,
    width: 150,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },
  cardImageBG: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
  },
  favoritePosition: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  cardTitle: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardPriceCurrency: {
    color: 'black',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 2,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  addButton: {
    backgroundColor: '#F16122',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

