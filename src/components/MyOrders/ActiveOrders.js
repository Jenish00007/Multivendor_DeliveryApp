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
import { useAppBranding } from '../../utils/translationHelper';

const ActiveOrders = ({ navigation, activeOrders, loading, error, reFetchOrders }) => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const currentTheme = theme[themeContext.ThemeValue];
  const configuration = useContext(ConfigurationContext);
  const { token } = useContext(AuthContext);
  const branding = useAppBranding();

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

  if (loading && (!activeOrders || activeOrders.length === 0)) {
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
        backgroundColor={branding.primaryColor}
        barStyle="dark-content"
        translucent={false}
        animated={true}
      />
      <FlatList
        data={activeOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item?._id?.toString()}
        ListEmptyComponent={emptyView}
        onRefresh={reFetchOrders}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const OrderCard = ({ item, navigation, currentTheme, configuration }) => {
  const { t } = useTranslation();
  
  if (!item) return null;
  
  const orderId = item._id;
  const date = new Date(item.createdAt);
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  
  const orderStatus = item.status?.toUpperCase() || 'PENDING';
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.cardContainer, {backgroundColor: currentTheme.white}]}
      onPress={() => navigation.navigate('OrderDetail', { id: item._id })}>
      <View style={styles.cardHeader}>
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
        <View style={styles.itemsContainer}>
          {item.items?.map((product, index) => (
            <View key={index} style={styles.itemRow}>
              <TextDefault small textColor={currentTheme.fontSecondColor}>
                {product.name}
              </TextDefault>
              <TextDefault small textColor={currentTheme.fontSecondColor}>
                {product.shopName}
              </TextDefault>
            </View>
          ))}
        </View>
        
        <View style={styles.priceContainer}>
          <TextDefault textColor={currentTheme.fontMainColor} bold>
            {`Total: ₹${item.totalPrice?.toFixed(2)}`}
          </TextDefault>
        </View>

        <View style={styles.addressContainer}>
          <TextDefault small textColor={currentTheme.fontSecondColor}>
            {`${item.shippingAddress?.address}, ${item.shippingAddress?.city}, ${item.shippingAddress?.state} - ${item.shippingAddress?.pincode}`}
          </TextDefault>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: scale(10),
  },
  cardContainer: {
    marginBottom: scale(10),
    borderRadius: scale(8),
    padding: scale(15),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  orderInfoContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(4),
  },
  orderDetails: {
    marginTop: scale(10),
  },
  itemsContainer: {
    marginBottom: scale(10),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(5),
  },
  priceContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: scale(10),
    marginBottom: scale(10),
  },
  addressContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingTop: scale(10),
  },
});

export default ActiveOrders;