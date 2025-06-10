import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, RefreshControl, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import RestaurantPreparing from '../../assets/SVG/restaurant-preparing';
import DeliveryIcon from '../../assets/SVG/delivery-icon';
import BottomTab from '../../components/BottomTab/BottomTab';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import { theme } from '../../utils/themeColors';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';

const DeliveryHome = () => {
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(false);
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const themeContext = React.useContext(ThemeContext);
    const currentTheme = theme[themeContext.ThemeValue];

    const fetchOrders = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
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
        fetchOrders();
    }, []);

    const toggleSwitch = () => {
        setIsOnline((previousState) => !previousState);
    };

    const handleOrderPress = (order) => {
        navigation.navigate('OrderDetailsScreen', { order });
    };

    const OrderCard = ({ order }) => (
        <TouchableOpacity 
            style={[styles.card, { backgroundColor: currentTheme.themeBackground === '#000' ? '#1a1a1a' : '#ffffff' }]} 
            onPress={() => handleOrderPress(order)}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={[styles.orderIdLabel, { color: currentTheme.newFontcolor }]}>Order ID</Text>
                    <Text style={[styles.orderId, { color: currentTheme.newFontcolor }]}>#{order._id.slice(-6)}</Text>
                </View>
                <View style={[styles.paymentBadge, { 
                    backgroundColor: order.paymentMethod === 'COD' ? '#FF6B6B' : '#4ECDC4' 
                }]}>
                    <Text style={styles.paymentText}>{order.paymentMethod}</Text>
                </View>
            </View>
            
            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <RestaurantPreparing width={18} height={18} />
                    </View>
                    <Text style={[styles.restaurantText, { color: currentTheme.newFontcolor }]}>
                        {order.restaurant?.name || 'Restaurant Name'}
                    </Text>
                </View>
                
                <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                        <MaterialIcon name="location-on" size={18} color="#FF6B6B" />
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                        {order.deliveryAddress}
                    </Text>
                </View>
            </View>
            
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.detailsBtn]}
                    onPress={() => handleOrderPress(order)}
                    activeOpacity={0.8}
                >
                    <MaterialIcon name="info-outline" size={18} color="#6B7280" />
                    <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.directionBtn]}
                    onPress={() => navigation.navigate('DeliveryTrackingScreen', { order })}
                    activeOpacity={0.8}
                >
                    <MaterialIcon name="directions" size={18} color="#ffffff" />
                    <Text style={styles.directionBtnText}>Navigate</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const StatsCard = ({ title, value, color, icon }) => (
        <View style={[styles.statsCard, { backgroundColor: color }]}>
            <View style={styles.statsHeader}>
                <MaterialIcon name={icon} size={24} color="#ffffff" />
                <Text style={styles.statsValue}>{value}</Text>
            </View>
            <Text style={styles.statsTitle}>{title}</Text>
        </View>
    );

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
            <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.themeBackground }]}>
                <View style={styles.content}>
                    {/* Enhanced Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTop}>
                            <View style={styles.headerLeft}>
                                <View style={styles.logoContainer}>
                                    <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                                </View>
                                <View>
                                    <Text style={[styles.welcomeText, { color: currentTheme.newFontcolor }]}>
                                        Welcome Back
                                    </Text>
                                    <Text style={[styles.headerTitle, { color: currentTheme.newFontcolor }]}>
                                        Delivery Partner
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.headerRight}>
                                <TouchableOpacity style={styles.notificationBtn}>
                                    <MaterialIcon name="notifications" size={24} color={currentTheme.newFontcolor} />
                                    <View style={styles.notificationBadge}>
                                        <Text style={styles.notificationCount}>3</Text>
                                    </View>
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
                        <View style={styles.statsGrid}>
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
                        </View>

                         {/* Orders Section */}
                         <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: currentTheme.newFontcolor }]}>
                                Active Orders
                            </Text>
                            <Text style={[styles.sectionSubtitle, { color: currentTheme.newFontcolor }]}>
                                {orders.length} orders available
                            </Text>
                        </View>

                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <OrderCard key={order._id} order={order} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialIcon name="delivery-dining" size={64} color="#D1D5DB" />
                                <Text style={styles.emptyStateTitle}>No Active Orders</Text>
                                <Text style={styles.emptyStateText}>
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
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3F4F6',
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationBtn: {
        position: 'relative',
        padding: 8,
    },
    notificationBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationCount: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    switch: {
        transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
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
        color: '#ffffff',
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
        backgroundColor: '#F3F4F6',
    },
    detailsBtnText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 14,
    },
    directionBtn: {
        backgroundColor: '#F16122',
    },
    directionBtnText: {
        color: '#ffffff',
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
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
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
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statsTitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default DeliveryHome;