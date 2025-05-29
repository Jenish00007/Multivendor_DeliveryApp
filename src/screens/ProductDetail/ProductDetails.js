import React, { useContext, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  FlatList, 
  Dimensions,
  useColorScheme
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import AddToFavourites from './../../components/Favourites/AddtoFavourites';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AuthContext from '../../context/Auth';
import { LocationContext } from '../../context/Location';
import UserContext from '../../context/User';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors'; // Import the theme object
import styles from './ProductDetailsStyles'; // Base styles

const { width } = Dimensions.get('window');

const ProductDetail = (profile) => {
    const route = useRoute();
    const navigation = useNavigation();
    const { product } = route.params;
    const { location } = useContext(LocationContext);
    const { token } = useContext(AuthContext);
    const { isLoggedIn, addToCart } = useContext(UserContext);
    const themeContext = useContext(ThemeContext);
    const currentTheme = theme[themeContext.ThemeValue];
    const [loading, setLoading] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const flatListRef = useRef(null);
    
    // Get the current color scheme (system preference)
    const colorScheme = useColorScheme();
    
    // Check if the product has multiple images
    const hasMultipleImages = product?.images_full_url && product.images_full_url.length > 0;
    const images = hasMultipleImages ? product.images_full_url : [product?.image_full_url];

    // Stock status display
    const stockStatus = product?.stock > 0 ? 'In Stock' : 'Out of Stock';
    const stockColor = product?.stock > 0 ? '#2E7D32' : '#D32F2F';

    // Handle image change when dots are clicked
    const handleImageChange = (index) => {
        setActiveImageIndex(index);
        flatListRef.current?.scrollToIndex({ animated: true, index });
    };

    // Function to handle scroll end to update the active dot indicator
    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        if (index !== activeImageIndex) {
            setActiveImageIndex(index);
        }
    };

    // Render rating stars
    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const halfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FontAwesome key={i} name="star" size={16} color="#FFC107" />);
            } else if (i === fullStars && halfStar) {
                stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#FFC107" />);
            } else {
                stars.push(<FontAwesome key={i} name="star-o" size={16} color="#FFC107" />);
            }
        }
        return stars;
    };

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            navigation.navigate('Login');
            return;
        }

        // Check if product is in stock
        if (product?.stock <= 0) {
            Alert.alert("Out of Stock", "This product is currently unavailable.");
            return;
        }

        setLoading(true);
        try {
            const result = await addToCart(product);
            if (result.success) {
                Alert.alert("Success", result.message);
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            Alert.alert("Error", "An error occurred while adding to cart.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar 
                backgroundColor="#F16122"
                barStyle="dark-content"
            />
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                
                {/* Product Image Section with Favorite Icon */}
                <View style={[styles.imageContainer, { backgroundColor: currentTheme.itemCardColor }]}>
                    {hasMultipleImages ? (
                        <>
                            <FlatList
                                ref={flatListRef}
                                data={images}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={handleScroll}
                                keyExtractor={(item, index) => `image_${index}`}
                                renderItem={({ item }) => (
                                    <Image 
                                        source={{ uri: item }} 
                                        style={[styles.productImage, { width }]}
                                        resizeMode="cover"
                                    />
                                )}
                            />
                            
                            {/* Dot indicators for image carousel */}
                            <View style={styles.dotContainer}>
                                {images.map((_, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={[
                                            styles.dot, 
                                            activeImageIndex === index && styles.activeDot
                                        ]}
                                        onPress={() => handleImageChange(index)}
                                    />
                                ))}
                            </View>
                        </>
                    ) : (
                        <Image 
                            source={{ uri: product?.image_full_url }} 
                            style={styles.productImage} 
                            resizeMode="cover"
                        />
                    )}
                    <View style={styles.favIconContainer}>
                        <AddToFavourites product={product} />
                    </View>
                </View>
                
                {/* Product Information Section */}
                <View style={[styles.infoSection, { backgroundColor: currentTheme.itemCardColor }]}>
                    <View style={styles.nameAndPrice}>
                        <Text style={[styles.productName, { color: currentTheme.fontMainColor }]}>
                            {product?.name}
                        </Text>
                        <Text style={[styles.productPrice, { color: currentTheme.primary }]}>
                            ₹{product?.price}
                        </Text>
                    </View>
                    
                    {/* Rating and Stock Status */}
                    <View style={styles.ratingStockContainer}>
                        <View style={styles.ratingContainer}>
                            <View style={styles.starsContainer}>
                                {renderRatingStars(product?.avg_rating)}
                            </View>
                            <Text style={[styles.ratingText, { color: currentTheme.fontSecondColor }]}>
                                ({product?.rating_count || 0} reviews)
                            </Text>
                        </View>
                        <View style={[styles.stockBadge, {backgroundColor: stockColor + '20'}]}>
                            <Text style={[styles.stockText, {color: stockColor}]}>
                                {stockStatus}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={[styles.divider, { backgroundColor: currentTheme.borderBottomColor }]} />
                    
                    <View style={styles.descriptionContainer}>
                        <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
                            Description
                        </Text>
                        <Text style={[styles.productDescription, { color: currentTheme.fontSecondColor }]}>
                            {product?.description || 'No description available for this product.'}
                        </Text>
                    </View>

                    {/* Nutrition Information */}
                    {product?.nutritions_name && product.nutritions_name.length > 0 && (
                        <View style={styles.nutritionContainer}>
                            <Text style={[styles.sectionTitle, { color: currentTheme.fontMainColor }]}>
                                Nutrition Information
                            </Text>
                            {product.nutritions_name.map((nutrition, index) => (
                                <Text key={index} style={[styles.nutritionText, { color: currentTheme.fontSecondColor }]}>
                                    • {nutrition}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
            
            {/* Fixed bottom action buttons */}
            <View style={[styles.bottomActions, { backgroundColor: currentTheme.itemCardColor }]}>
                <TouchableOpacity 
                    style={[styles.cartButton, { backgroundColor: currentTheme.primary }]} 
                    onPress={() => {
                        if (!isLoggedIn) {
                            navigation.navigate('Login');
                            return;
                        }
                        navigation.navigate('Cart');
                    }}
                >
                    <MaterialIcons name="shopping-cart" size={20} color="#fff" />
                    <Text style={styles.buttonText}>View Cart</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.addButton, 
                        { backgroundColor: currentTheme.primary },
                        (loading || product?.stock <= 0) && { opacity: 0.7 }
                    ]}  
                    onPress={handleAddToCart}
                    disabled={loading || product?.stock <= 0}
                >
                    <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                    <Text style={styles.buttonText}>
                        {loading ? "Adding..." : product?.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProductDetail;