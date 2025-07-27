import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, RefreshControl, StatusBar, Alert, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import RestaurantPreparing from '../../assets/SVG/restaurant-preparing';
import DeliveryIcon from '../../assets/SVG/delivery-icon';
import BottomTab from '../../components/BottomTab/BottomTab';
import Logo from '../../components/Logo/Logo';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { useUserContext } from '../../context/User';
import { API_URL } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from '../../context/Auth';
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage';
import { useConfiguration } from '../../context/Configuration';
import { useAppBranding } from '../../utils/translationHelper';

const DeliveryHome = () => {
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(false);
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const { token, formetedProfileData, isDeliveryMan } = useUserContext();
    const { logout } = React.useContext(AuthContext);
    const { appName } = useConfiguration();
    const branding = useAppBranding();

    const handleLogout = async () => {
        try {
            await logout();
            FlashMessage({
                message: 'Logged out successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Logout error:', error);
            FlashMessage({
                message: 'Error during logout',
                type: 'danger'
            });
        }
    }; 
     useEffect(() => {
    
        fetchOrders();
      
  }, [token]);

  const handleDirection = async (order) => {
    try {
      let destinationAddress = '';
      let destinationName = '';
      let coordinates = null;
      
      // Check for customer location with coordinates (priority)
      if (order?.userLocation?.latitude && order?.userLocation?.longitude) {
        coordinates = {
          latitude: order.userLocation.latitude,
          longitude: order.userLocation.longitude
        };
        destinationAddress = order.userLocation.deliveryAddress || 'Customer Location';
        destinationName = order.user?.name || order.shippingAddress?.name || 'Customer';
      } else {
        // Fallback to address-based navigation
        destinationAddress = order?.shippingAddress?.address || 
                           order?.shippingAddress?.address1 || 
                           'Customer Address';
        destinationName = order?.user?.name || 
                         order?.shippingAddress?.name || 
                         'Customer';
      }

      if (!destinationAddress && !coordinates) {
        Alert.alert('Error', 'Destination address not available');
        return;
      }

      let mapsUrl = '';
      
      if (coordinates) {
        // Use coordinates for more accurate navigation
        mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
      } else {
        // Fallback to address-based navigation
        const encodedAddress = encodeURIComponent(destinationAddress);
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      }
      
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(mapsUrl);
      
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to Apple Maps on iOS or try alternative
        let fallbackUrl = '';
        if (coordinates) {
          fallbackUrl = Platform.OS === 'ios' 
            ? `http://maps.apple.com/?daddr=${coordinates.latitude},${coordinates.longitude}`
            : `geo:${coordinates.latitude},${coordinates.longitude}`;
        } else {
          const encodedAddress = encodeURIComponent(destinationAddress);
          fallbackUrl = Platform.OS === 'ios' 
            ? `http://maps.apple.com/?q=${encodedAddress}`
            : `geo:0,0?q=${encodedAddress}`;
        }
        
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.error('Error in handleDirection:', error);
      Alert.alert('Error', 'Failed to open directions. Please check if you have a maps app installed.');
    }
  };

    const fetchOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
    console.log("Token", token);
            if (!token) {
                console.log('No token available');
                return;
            }
            
            const response = await fetch(`${API_URL}/deliveryman/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            if (data.success) {
                setOrders(data.orders || []);
            } else {
                throw new Error(data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchOrders().finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        if (token && isDeliveryMan()) {
            fetchOrders();
        }
    }, [token]);

    const toggleSwitch = () => {
        setIsOnline((previousState) => !previousState);
    };

    const handleOrderPress = (order) => {
        navigation.navigate('OrderDetailsScreen', {
            orderId: order._id,
            restaurant: {
                name: order.store?.name || order.shopName?.name || 'Shop Name',
                address: order.store?.address || order.store?.ShopAddress?.address || 'Shop Address',
                phone: order.store?.phone || 'Shop Phone'
            },
            customer: {
                name: order.customer?.name || order.user?.name || 'User Name',
                address: order.deliveryAddress || order.shippingAddress?.address || 'User Address',
                phone: order.customer?.phone || order.user?.phone || 'User Phone'
            },
            items: order.items || [],
            totalItems: order.items?.length || 0,
            paymentMethod: order.paymentMethod || order.paymentInfo?.type || 'COD',
            additionalNote: order.note || order.delivery_instruction || ''
        });
    };

    const OrderCard = ({ order }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: branding.backgroundColor }]} 
            onPress={() => handleOrderPress(order)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={[styles.orderIdLabel, { color: branding.textColor }]}>Order ID</Text>
                    <Text style={[styles.orderId, { color: branding.textColor }]}>#{order._id.slice(-6)}</Text>
                </View>
                <View style={[styles.paymentBadge, { 
                    backgroundColor: order.paymentInfo?.type === 'cash_on_delivery' ? branding.cartDeleteColor : branding.cartDiscountColor 
                }]}>
                    <Text style={[styles.paymentText, { color: branding.whiteColorText }]}>{order.paymentInfo?.type === 'cash_on_delivery' ? 'COD' : 'Online'}</Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <RestaurantPreparing width={18} height={18} />
                    </View>
                    <Text style={[styles.restaurantText, { color: branding.textColor }]}>
                        {order.shop?.name || order.store?.name || order.shopName?.name || 'Shop Name'}
                    </Text> 
                </View>
                
                {/* <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <MaterialIcon name="location-on" size={18} color="#FF6B6B" />
                    </View>
                    <Text style={[styles.addressText, { color: branding.textColor }]} numberOfLines={2}>
                        {order.shop?.address || order.store?.address || order.store?.ShopAddress?.address || 'Shop Address'}
                    </Text>
                </View> */}
            </View>
            
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.detailsBtn, { backgroundColor: branding.secondaryBackground }]}
                    onPress={() => handleOrderPress(order)}
                    activeOpacity={0.8}
                >
                    <MaterialIcon name="info-outline" size={18} color={branding.textColor} />
                    <Text style={[styles.detailsBtnText, { color: branding.textColor }]}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.directionBtn, { backgroundColor: branding.primaryColor }]}
                     onPress={() => handleDirection(order)}
                    activeOpacity={0.8}
                >
                    <MaterialIcon name="directions" size={18} color={branding.whiteColorText} />
                    <Text style={[styles.directionBtnText, { color: branding.whiteColorText }]}>Navigate</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const StatsCard = ({ title, value, color, icon }) => (
        <View style={[styles.statsCard, { backgroundColor: color }]}>
            <View style={styles.statsHeader}>
                <MaterialIcon name={icon} size={24} color={branding.whiteColorText} />
                <Text style={[styles.statsValue, { color: branding.whiteColorText }]}>{value}</Text>
            </View>
            <Text style={[styles.statsTitle, { color: branding.whiteColorText }]}>{title}</Text>
        </View>
    );

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor={branding.primaryColor} />
            <SafeAreaView style={[styles.container, { backgroundColor: branding.backgroundColor }]}>
                <View style={styles.content}>
                    {/* Enhanced Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTop}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.logoContainer, { backgroundColor: branding.secondaryBackground }]}>
                                    <Logo style={styles.logo} />
                                </View>
                                <View>
                                    <Text style={[styles.welcomeText, { color: branding.textColor }]}>
                                        Welcome Back
                                    </Text>
                                    <Text style={[styles.headerTitle, { color: branding.textColor }]}>
                                        {formetedProfileData?.name || 'Delivery Partner'}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.headerRight}>
                                <TouchableOpacity 
                                    style={styles.logoutBtn}
                                    onPress={handleLogout}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcon name="logout" size={24} color={branding.textColor} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        {/* Online Status Card */}
                        {/* <View style={[styles.statusCard, { 
                            backgroundColor: isOnline ? '#F16122' : '#6B7280',
                            borderColor: isOnline ? '#34D399' : '#9CA3AF'
                        }]}>
                            <View style={styles.statusLeft}>
                                <View style={[styles.statusIndicator, { 
                                    backgroundColor: isOnline ? '#34D399' : '#D1D5DB' 
                                }]} />
                                <Text style={styles.statusText}>
                                    You are {isOnline ? 'Online' : 'Offline'}
                                </Text>
                            </View>
                            <Switch
                                trackColor={{ false: '#374151', true: '#34D399' }}
                                thumbColor={isOnline ? '#ffffff' : '#D1D5DB'}
                                onValueChange={toggleSwitch}
                                value={isOnline}
                                style={styles.switch}
                            />
                        </View> */}
                    </View>

                    <ScrollView 
                        style={styles.scrollView} 
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Enhanced Earnings Card */}
                        {/* <View style={styles.earningsCard}>
                            <View style={styles.earningsHeader}>
                                <View style={styles.earningsIconContainer}>
                                    <DeliveryIcon width={28} height={28} />
                                </View>
                                <View style={styles.earningsInfo}>
                                    <Text style={styles.balanceLabel}>Total Balance</Text>
                                    <Text style={styles.balanceValue}>₹5,855.65</Text>
                                </View>
                                <TouchableOpacity style={styles.withdrawBtn}>
                                    <Text style={styles.withdrawText}>Withdraw</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.earningsGrid}>
                                <View style={styles.earningsItem}>
                                    <Text style={styles.earningsAmount}>₹2,535.65</Text>
                                    <Text style={styles.earningsLabel}>Today</Text>
                                </View>
                                <View style={styles.earningsDivider} />
                                <View style={styles.earningsItem}>
                                    <Text style={styles.earningsAmount}>₹10,835.65</Text>
                                    <Text style={styles.earningsLabel}>This Week</Text>
                                </View>
                                <View style={styles.earningsDivider} />
                                <View style={styles.earningsItem}>
                                    <Text style={styles.earningsAmount}>₹24,945.65</Text>
                                    <Text style={styles.earningsLabel}>This Month</Text>
                                </View>
                            </View>
                        </View> */}

                       
                        {/* Enhanced Stats Grid */}
                        {/* <View style={styles.statsGrid}>
                            <StatsCard 
                                title="Today's Orders"
                                value={orders.length.toString()}
                                color="#4F46E5"
                                icon="today"
                            />
                            <StatsCard 
                                title="This Week"
                                value="12"
                                color="#0891B2"
                                icon="date-range"
                            />
                            <StatsCard 
                                title="Total Orders"
                                value="156"
                                color="#059669"
                                icon="assignment"
                            />
                            <StatsCard 
                                title="Cash in Hand"
                                value="₹6,225"
                                color="#DC2626"
                                icon="account-balance-wallet"
                            />
                        </View> */}

                         {/* Orders Section */}
                         <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: branding.textColor }]}>
                                Active Orders
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: branding.textColor }]}>
                                {orders.length} orders available
                            </Text>
                        </View>

                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <OrderCard key={order._id} order={order} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialIcon name="delivery-dining" size={64} color={branding.textColor} />
                                <Text style={[styles.emptyStateTitle, { color: branding.textColor }]}>No Active Orders</Text>
                                <Text style={[styles.emptyStateText, { color: branding.textColor }]}>
                                    New orders will appear here when available
                                </Text>
                            </View>
                        )}

                    </ScrollView>
                    
                    <BottomTab screen="HOME" />
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRight: {
        alignItems: 'center',
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    logo: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    welcomeText: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logoutBtn: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    earningsCard: {
        backgroundColor: '#1F2937',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    earningsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    earningsIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    earningsInfo: {
        flex: 1,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        marginBottom: 4,
    },
    balanceValue: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    withdrawBtn: {
        backgroundColor: '#F16122',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    withdrawText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    earningsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    earningsItem: {
        flex: 1,
        alignItems: 'center',
    },
    earningsDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
    earningsAmount: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    earningsLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
    },
    sectionHeader: {
        marginBottom: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderIdContainer: {
        flex: 1,
    },
    orderIdLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 2,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    paymentBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    paymentText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardContent: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    restaurantText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
        lineHeight: 20,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    detailsBtn: {
    },
    detailsBtnText: {
        fontWeight: '600',
        fontSize: 14,
    },
    directionBtn: {
    },
    directionBtnText: {
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 24,
    },
    statsCard: {
        flex: 1,
        minWidth: '47%',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statsHeader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statsTitle: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default DeliveryHome;