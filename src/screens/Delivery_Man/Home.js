import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import RestaurantPreparing from '../../assets/SVG/restaurant-preparing';
import DeliveryIcon from '../../assets/SVG/delivery-icon';
import BottomTab from '../../components/BottomTab/BottomTab';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const Home = () => {
    const navigation = useNavigation();
    const [isOnline, setIsOnline] = useState(false); // State to track online/offline status

    const toggleSwitch = () => {
      setIsOnline((previousState) => !previousState);
    };
    const handleOrderPress = () => {
        navigation.navigate('OrderDetailsScreen', {
            orderId: '2CE5DW',
            orderType: 'COD',
            restaurantLocation: 'Restaurant Location',
            deliveryAddress: '3460 Pallet Street, New York, New York'
        });
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                        <Text style={styles.headerTitle}>Order Request</Text>
                    </View>
                    <View style={styles.headerRight}>

                        <View style={styles.onlineStatus}>
                            <Switch
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={isOnline ? '#4CAF50' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isOnline}
                                style={styles.switch}
                            />
                            <Text style={[styles.onlineText, { color: isOnline ? '#4CAF50' : '#767577' }]}>
                                {isOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Active Order Card */}
                <TouchableOpacity style={styles.card} onPress={handleOrderPress}>
                    <View style={styles.cardRow}>
                        <Text style={styles.orderId}>Order ID: <Text style={styles.bold}>#2CE5DW</Text></Text>
                        <Text style={styles.cod}>COD</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <RestaurantPreparing width={20} height={20} />
                        <Text style={styles.restaurantText}>Restaurant Location</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <MaterialIcon name="location-on" size={16} color="#6fcf97" />
                        <Text style={styles.addressText}>3460 Pallet Street, New York, New York</Text>
                    </View>
                    <View style={styles.cardBtnRow}>
                        <TouchableOpacity
                            style={styles.detailsBtn}
                            onPress={handleOrderPress}
                        >
                            <Text style={styles.detailsBtnText}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.directionBtn}
                            onPress={() => navigation.navigate('DeliveryTrackingScreen')}
                        >
                            <Text style={styles.directionBtnText}>Direction</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* Earnings Card */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsHeader}>
                        <DeliveryIcon width={30} height={30} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.balanceLabel}>Balance</Text>
                            <Text style={styles.balanceValue}>₹5,855.65</Text>
                        </View>
                    </View>
                    <View style={styles.earningsRow}>
                        <View style={styles.earningsCol}>
                            <Text style={styles.earningsAmount}>₹2,535.65</Text>
                            <Text style={styles.earningsLabel}>Today</Text>
                        </View>
                        <View style={styles.earningsCol}>
                            <Text style={styles.earningsAmount}>₹10,835.65</Text>
                            <Text style={styles.earningsLabel}>This week</Text>
                        </View>
                        <View style={styles.earningsCol}>
                            <Text style={styles.earningsAmount}>₹24,945.65</Text>
                            <Text style={styles.earningsLabel}>This Month</Text>
                        </View>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummaryRow}>
                    <View style={styles.orderSummaryBox}>
                        <Text style={styles.orderSummaryNumber}>55</Text>
                        <Text style={styles.orderSummaryLabel}>Todays{"\n"}Orders</Text>
                    </View>
                    <View style={[styles.orderSummaryBox, { backgroundColor: '#1cc7e6' }]}>
                        <Text style={styles.orderSummaryNumber}>05</Text>
                        <Text style={styles.orderSummaryLabel}>This Week{"\n"}Orders</Text>
                    </View>
                </View>

                <View style={styles.statsSection}>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsNumber}>35</Text>
                        <Text style={styles.statsLabel}>Total Orders</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsNumber}>₹6,225</Text>
                        <Text style={styles.statsLabel}>Cash In Your Hand</Text>
                    </View>
                </View>

            </ScrollView>
            <BottomTab screen="HOME" />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        paddingTop: 40,
        paddingBottom: 80,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 38,
        height: 38,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1cc7e6',
        marginLeft: 2,
        letterSpacing: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        marginRight: 10,
    },
    
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      switch: {
        marginRight: 10,
      },
      onlineText: {
        fontSize: 16,
        fontWeight: '500',
      },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    orderId: {
        fontSize: 15,
        color: '#222',
        flex: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    cod: {
        color: '#e74c3c',
        fontWeight: 'bold',
        fontSize: 13,
    },
    restaurantText: {
        marginLeft: 8,
        color: '#222',
        fontWeight: '600',
        fontSize: 14,
    },
    addressText: {
        marginLeft: 6,
        color: '#888',
        fontSize: 13,
        flex: 1,
    },
    cardBtnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    detailsBtn: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    detailsBtnText: {
        color: '#222',
        fontWeight: 'bold',
    },
    directionBtn: {
        flex: 1,
        backgroundColor: '#6fcf97',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    directionBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    earningsCard: {
        backgroundColor: '#1cc7a7',
        borderRadius: 12,
        padding: 18,
        marginBottom: 18,
    },
    earningsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    balanceLabel: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.8,
    },
    balanceValue: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 2,
    },
    earningsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    earningsCol: {
        alignItems: 'center',
        flex: 1,
    },
    earningsAmount: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    earningsLabel: {
        color: '#fff',
        fontSize: 13,
        opacity: 0.8,
        marginTop: 2,
    },
    orderSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    orderSummaryBox: {
        flex: 1,
        backgroundColor: '#6fcf97',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginRight: 10,
    },
    orderSummaryNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 28,
    },
    orderSummaryLabel: {
        color: '#fff',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4,
    },
    statsSection: {
        marginTop: 18,
        marginBottom: 18,
    },
    statsCard: {
        backgroundColor: '#10B981',
        borderRadius: 16,
        paddingVertical: 28,
        paddingHorizontal: 18,
        alignItems: 'center',
        marginBottom: 18,
    },
    statsNumber: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 28,
    },
    statsLabel: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default Home;
