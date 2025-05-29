import React, { useContext, useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import { theme } from '../../utils/themeColors';
import TextDefault from '../Text/TextDefault/TextDefault';
import TextError from '../Text/TextError/TextError';
import { alignment } from '../../utils/alignment';
import { scale } from '../../utils/scaling';
import { useTranslation } from 'react-i18next';
import ConfigurationContext from '../../context/Configuration';
import { calulateRemainingTime } from '../../utils/customFunctions';
import Spinner from '../Spinner/Spinner';
import EmptyView from '../EmptyView/EmptyView';
import AuthContext from '../../context/Auth';
import { StatusBar } from 'react-native';

const ActiveOrders = ({ navigation }) => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useContext(ConfigurationContext);
  const { token } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t('myOrders'),
      headerTitleStyle: { 
        color: currentTheme.newFontcolor,
        fontSize: scale(18),
        fontWeight: '600'
      },
      headerStyle: { 
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0,
        shadowOpacity: 0
      },
      headerTintColor: currentTheme.newFontcolor,
      headerTitleAlign: 'center'
    });
  }, [navigation, currentTheme, t]);

  useEffect(() => {
    fetchActiveOrders();
    
    // Set up polling to refresh orders periodically
    const intervalId = setInterval(() => {
      fetchActiveOrders();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      setLoading(true);
      const headers = {
        'moduleId': '1',
        'zoneId': '[1]',
        'Authorization': token ? `Bearer ${token}` : ''
      };

      const response = await fetch(
        'https://6ammart-admin.6amtech.com/api/v1/customer/order/running-orders?offset=1&limit=10',
        {
          method: 'GET',
          headers: headers
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.orders || !Array.isArray(data.orders)) {
        console.error('Invalid API response format:', data);
        setActiveOrders([]);
        return;
      }
      
      setActiveOrders(data.orders);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch active orders');
      console.error('Error fetching active orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const emptyView = () => {
    return (
      <EmptyView
        title={t('titleEmptyActiveOrders')}
        description={t('emptyActiveOrdersDesc')}
        buttonText={t('emptyActiveOrdersBtn')}
      />
    );
  };

  const renderItem = ({ item }) => {
    return (
      <OrderCard
        item={item}
        navigation={navigation}
        currentTheme={currentTheme}
        configuration={configuration}
      />
    );
  };

  if (loading && activeOrders.length === 0) {
    return (
      <Spinner
        size={'small'}
        backColor={currentTheme.themeBackground}
        spinnerColor={currentTheme.main}
      />
    );
  }
  if (error) return <TextError text={error} />;

  return (
    <View style={[styles.container, {backgroundColor: currentTheme.themeBackground}]}>
      <StatusBar
        backgroundColor="#F16122"
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />
      <FlatList
        data={activeOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id?.toString()}
        ListEmptyComponent={emptyView}
        onRefresh={fetchActiveOrders}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const OrderCard = ({ item, navigation, currentTheme, configuration }) => {
  const { t } = useTranslation();
  
  if (!item) return null;
  
  const remainingTime = calulateRemainingTime(item) || 15;
  const orderId = item.id;
  const date = new Date(item.created_at);
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  
  const orderStatus = item.order_status?.toUpperCase() || 'PENDING';
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.cardContainer, {backgroundColor: currentTheme.white}]}
      onPress={() => navigation.navigate('OrderDetail', { id: orderId })}>
      <View style={styles.cardHeader}>
        {item.store?.logo_full_url ? (
          <Image
            style={styles.restaurantLogo}
            source={{uri: item.store.logo_full_url}}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.logoPlaceholder, {backgroundColor: currentTheme.secondaryBackground}]}>
            <TextDefault textColor={currentTheme.fontMainColor} center bold>
              {item.store?.name?.charAt(0) || 'R'}
            </TextDefault>
          </View>
        )}
        <View style={styles.orderInfoContainer}>
          <TextDefault textColor={currentTheme.fontMainColor} bold>
            {`Order #${orderId}`}
          </TextDefault>
          <TextDefault small textColor={currentTheme.fontSecondColor}>
            {formattedDate}
          </TextDefault>
        </View>
        <View style={[styles.statusBadge, {backgroundColor: currentTheme.secondaryBackground}]}>
          <TextDefault small textColor={currentTheme.statusColor || 'green'}>
            {orderStatus}
          </TextDefault>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderDetailRow}>
          <TextDefault style={styles.orderDetailLabel}>
            {t('Restaurant')}
          </TextDefault>
          <TextDefault style={styles.orderDetailValue}>
            {item.store?.name || 'N/A'}
          </TextDefault>
        </View>
        <View style={styles.orderDetailRow}>
          <TextDefault style={styles.orderDetailLabel}>
            {t('Amount')}
          </TextDefault>
          <TextDefault style={styles.orderDetailValue}>
            ₹{item.order_amount?.toFixed(2) || '0.00'}
          </TextDefault>
        </View>
      </View>

      <View style={styles.trackButtonContainer}>
        <TouchableOpacity 
          style={[styles.trackButton, {borderColor: currentTheme.statusColor || 'green'}]}
          onPress={() => navigation.navigate('OrderDetail', { id: orderId })}>
          <TextDefault small textColor={currentTheme.statusColor || 'green'}>
            {t('View Details')}
          </TextDefault>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: scale(15),
  },
  cardContainer: {
    borderRadius: scale(8),
    marginBottom: scale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: scale(15),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  restaurantLogo: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#f0f0f0',
  },
  logoPlaceholder: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  orderInfoContainer: {
    flex: 1,
    marginLeft: scale(15),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
    backgroundColor: '#f0f0f0',
  },
  trackButtonContainer: {
    marginTop: scale(10),
    alignItems: 'flex-end',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: scale(8),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  orderDetails: {
    marginTop: scale(10),
    paddingTop: scale(10),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(5),
  },
  orderDetailLabel: {
    color: '#666',
    fontSize: scale(12),
  },
  orderDetailValue: {
    color: '#333',
    fontSize: scale(12),
    fontWeight: '500',
  },
});

export default ActiveOrders;