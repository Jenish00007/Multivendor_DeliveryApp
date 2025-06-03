import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';
import UserContext from '../../context/User';

// CategoryListView component
const CategoryListView = ({ data }) => {
  const navigation = useNavigation();
  const { addToCart, isLoggedIn } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  // Function to truncate text longer than 15 letters
  const truncateText = (text) => {
    if (text && text.length > 12) {
      return text.substring(0, 12) + '...';
    }
    return text;
  };

  // Check if data is properly passed
  if (!data) {
    return null;
  }

  const { index, item } = data;

  // Ensure item is defined before rendering
  if (!item) {
    return null;
  }

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

  const formattedDistance = item?.distance ? `${Math.round(item?.distance / 1000) || '100+'} km` : 'N/A';

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })} style={{ height: 134, width: 280 }} touchOpacity={0.6} >
        <View style={styles.bgColorView} />
        <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row' }}>
          <View style={{ paddingVertical: 24, paddingLeft: 16, }}>
            <Image
              style={{ flex: 1, borderRadius: 16, aspectRatio: 1.0, }}
              source={{ uri: item?.image || item?.images?.[0] }}
            />
          </View>
          <View style={{ flex: 1, paddingLeft: 16, paddingVertical: 16 }}>
            <Text style={styles.title}>{truncateText(item?.title)}</Text>
            <View style={styles.lessionCountRatingContainer}>
              <Text style={[styles.textStyle, { flex: 1, fontSize: 16 }]}>
                {truncateText(item?.name)}
              </Text>
              <Text style={styles.textStyle}>{item?.rating}</Text>
              <AddToFavourites product={item}/>
            </View>
            <View style={{ flexDirection: 'row', paddingRight: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={styles.locationContainer}>
                 <Text style={styles.textStyle}>₹{item.discountPrice}</Text>
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
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: 'hidden' },
  bgColorView: {
    flex: 1,
    marginLeft: 55,
    borderRadius: 10,
    backgroundColor: '#F3FAFA',
  },
  closedBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  closedText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontFamily: 'WorkSans-SemiBold',
    letterSpacing: 0.27,
    color: '#17262A',
  },
  lessionCountRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingBottom: 8,
  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'WorkSans-Regular',
    letterSpacing: 0.27,
    color: 'black',
  },
  moneyText: {
    fontFamily: 'WorkSans-SemiBold',
    color: '#666666',
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 8,
  },
  statusText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
  },
  openBadge: {
    backgroundColor: '#FFF8E1',
  },
  openText: {
    color: '#F16122',
  },
  addIconView: {
    padding: 4,
    backgroundColor: '#F16122',
    borderRadius: 8,
    marginRight: 4,
  },
  addButton: {
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

export default CategoryListView;
