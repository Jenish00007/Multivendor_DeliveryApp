import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AddToFavourites from '../Favourites/AddtoFavourites';
import UserContext from '../../context/User';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OfferCard = ({item}) => {
    const navigation = useNavigation();
    const { addToCart, isLoggedIn } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const {
        name,
        active,
        address,
        distance,   
        image,
        discountPrice
    } = item;

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

    // Format distance to match the standardized format
    const formattedDistance = item?.distance ? `${Math.round(item.distance / 1000) || '100+'} km` : 'N/A';
    const truncatedName = name?.length > 12 ? `${name.substring(0, 12)}...` : name;

    // Validate image URI
    const imageUri = item?.image || item?.images?.[0];
    const validImageUri = typeof imageUri === 'string' && imageUri.trim() ? imageUri : null;

    return (
        <View style={supermarketStyles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                <View style={supermarketStyles.header}>
                    <View style={supermarketStyles.headerLeft}>
                        {validImageUri ? (
                          <Image
                            source={{ uri: validImageUri }}
                            style={supermarketStyles.logoIcon}
                          />
                        ) : (
                          <View style={supermarketStyles.logoIcon} />
                        )}
                        <Text style={supermarketStyles.title}>{truncatedName}</Text>
                    </View>
                    
                    <AddToFavourites product={item}/>
                </View>

                <View style={supermarketStyles.addressContainer}>
                    <Text style={supermarketStyles.address}>{address}</Text>
                </View>

                <View style={supermarketStyles.footer}>
                    <View style={supermarketStyles.footerLeft}>
                        <Text style={supermarketStyles.price}>₹{discountPrice}</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={handleAddToCart}
                        style={[supermarketStyles.addButton, { backgroundColor: '#F16122' }]}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Icon name="add" size={20} color="#000000" />
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default OfferCard;

const supermarketStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    newBadge: {
        backgroundColor: '#2E7D32',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    newText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    heartIcon: {
        width: 20,
        height: 20,
    },
    logoIcon: {
        width: 54,
        height: 54,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    address: {
        fontSize: 14,
        color: '#666666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F16122',
    },
    closedBadge: {
        backgroundColor: '#E0E0E0',
        borderRadius: 25,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    closedText: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '600',
    },
    openBadge: {
        backgroundColor: '#FFF8E1',
    },
    openText: {
        color: '#F16122',
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});