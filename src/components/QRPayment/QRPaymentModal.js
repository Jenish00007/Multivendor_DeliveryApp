import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppBranding } from '../../utils/translationHelper';

const { width, height } = Dimensions.get('window');

const QRPaymentModal = ({
  visible,
  onClose,
  qrData,
  paymentStatus,
  loading,
  error,
  isMonitoring,
  onConfirmCashPayment,
  onRegenerateQR,
  orderDetails,
}) => {
  const branding = useAppBranding();
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate time remaining for QR expiry
  useEffect(() => {
    if (qrData?.expires_at) {
      const updateTimer = () => {
        const expiryTime = new Date(qrData.expires_at).getTime();
        const currentTime = new Date().getTime();
        const remaining = Math.max(0, expiryTime - currentTime);
        setTimeRemaining(Math.floor(remaining / 1000));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [qrData]);

  // Handle opening payment URL
  const handleOpenPaymentUrl = async () => {
    // For UPI QR codes, the image_url is the actual payment link
    const paymentUrl = qrData?.qr_image_url;
    if (paymentUrl) {
      try {
        console.log('Opening payment URL:', paymentUrl);
        const supported = await Linking.canOpenURL(paymentUrl);
        if (supported) {
          await Linking.openURL(paymentUrl);
        } else {
          Alert.alert('Error', 'Cannot open payment link');
        }
      } catch (error) {
        console.error('Error opening payment URL:', error);
        Alert.alert('Error', 'Failed to open payment link');
      }
    } else {
      Alert.alert('Error', 'Payment link not available');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCashPayment = () => {
    Alert.alert(
      'Confirm Cash Payment',
      `Customer paid ₹${qrData?.amount || orderDetails?.totalAmount} in cash?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => onConfirmCashPayment('Customer paid in cash as requested'),
        },
      ]
    );
  };

  const renderQRCodeContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={branding.primaryColor} />
          <Text style={[styles.loadingText, { color: branding.textColor }]}>
            Generating QR Code...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={branding.cartDeleteColor} />
          <Text style={[styles.errorText, { color: branding.textColor }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: branding.primaryColor }]}
            onPress={onRegenerateQR}
          >
            <Icon name="refresh" size={20} color={branding.whiteColorText} />
            <Text style={[styles.retryButtonText, { color: branding.whiteColorText }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (paymentStatus === 'succeeded') {
      return (
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: branding.cartDiscountColor }]}>
            <Icon name="checkmark" size={48} color={branding.whiteColorText} />
          </View>
          <Text style={[styles.successTitle, { color: branding.cartDiscountColor }]}>
            Payment Received!
          </Text>
          <Text style={[styles.successAmount, { color: branding.textColor }]}>
            ₹{qrData?.amount || orderDetails?.totalAmount}
          </Text>
          <Text style={[styles.successMessage, { color: branding.textColor }]}>
            Order has been marked as paid
          </Text>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: branding.primaryColor }]}
            onPress={onClose}
          >
            <Text style={[styles.continueButtonText, { color: branding.whiteColorText }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (paymentStatus === 'expired') {
      return (
        <View style={styles.expiredContainer}>
          <Icon name="time-outline" size={64} color={branding.cartDeleteColor} />
          <Text style={[styles.expiredTitle, { color: branding.cartDeleteColor }]}>
            QR Code Expired
          </Text>
          <Text style={[styles.expiredMessage, { color: branding.textColor }]}>
            The QR code has expired. Generate a new one to continue.
          </Text>
          <TouchableOpacity
            style={[styles.regenerateButton, { backgroundColor: branding.primaryColor }]}
            onPress={onRegenerateQR}
          >
            <Icon name="refresh" size={20} color={branding.whiteColorText} />
            <Text style={[styles.regenerateButtonText, { color: branding.whiteColorText }]}>
              Generate New QR
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Always show QR code if modal is visible (with fallback data)
    const shouldShowQR = qrData || paymentStatus === 'processing' || visible;
    
    if (shouldShowQR) {
      return (
        <View style={styles.qrContainer}>
          {/* Header */}
          <Text style={[styles.qrTitle, { color: branding.textColor }]}>Collect Payment</Text>
          
          {/* Payment Amount Highlight */}
          <Text style={[styles.paymentAmount, { color: branding.primaryColor }]}>
            ₹{qrData?.display_amount || qrData?.amount || orderDetails?.totalAmount || '0.00'}
          </Text>
          
          {/* Payment Interface */}
          <View style={styles.paymentContainer}>
            {qrData ? (
              <View style={{ alignItems: 'center', width: '100%' }}>
                {/* QR Code Image */}
                {qrData.qr_image_url && (
                  <View style={[styles.qrCodeWrapper, { backgroundColor: '#FFFFFF' }]}>
                    <Image
                      source={{ uri: qrData.qr_image_url }}
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                      onError={(e) => {
                        console.log('QR Image failed to load:', e.nativeEvent.error);
                        console.log('QR Image URL:', qrData.qr_image_url);
                      }}
                      onLoad={() => console.log('QR Image loaded successfully')}
                    />
                  </View>
                )}
                
                {/* Instructions */}
                <Text style={[styles.qrInstructions, { color: branding.textColor }]}>
                  Ask customer to scan this QR code with any UPI app to pay
                </Text>
                
                {/* Alternative Payment Button */}
                <Text style={[styles.orText, { color: branding.textSecondary }]}>
                  OR
                </Text>
                
                <TouchableOpacity 
                  style={[styles.paymentLinkButton, { backgroundColor: branding.primaryColor }]}
                  onPress={handleOpenPaymentUrl}
                  activeOpacity={0.8}
                >
                  <Icon name="open-outline" size={24} color={branding.whiteColorText} />
                  <Text style={[styles.paymentLinkText, { color: branding.whiteColorText }]}>
                    Open Payment Page
                  </Text>
                  <Icon name="arrow-forward" size={20} color={branding.whiteColorText} />
                </TouchableOpacity>
                
                {/* Payment URL for debugging */}
                {__DEV__ && qrData?.qr_image_url && (
                  <Text style={{ fontSize: 10, color: '#999', marginTop: 8, textAlign: 'center' }}>
                    QR URL: {qrData.qr_image_url}
                  </Text>
                )}
              </View>
            ) : (
              <View style={{ 
                width: 200, 
                height: 200, 
                backgroundColor: '#f0f0f0', 
                justifyContent: 'center', 
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8
              }}>
                <ActivityIndicator size="small" color={branding.primaryColor} />
                <Text style={{ color: '#666', textAlign: 'center', marginTop: 8 }}>
                  Loading payment...
                </Text>
              </View>
            )}
          </View>

          {/* Payment Details */}
          <View style={[styles.paymentDetails, { backgroundColor: branding.secondaryBackground }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: branding.textColor }]}>Amount:</Text>
              <Text style={[styles.detailAmount, { color: branding.primaryColor }]}>
                ₹{qrData?.amount || orderDetails?.totalAmount || '0.00'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: branding.textColor }]}>Customer:</Text>
              <Text style={[styles.detailValue, { color: branding.textColor }]}>
                {qrData?.order_details?.customer_name || orderDetails?.customerName || 'Customer'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: branding.textColor }]}>Order ID:</Text>
              <Text style={[styles.detailValue, { color: branding.textColor }]}>
                #{(qrData?.order_details?.order_id || orderDetails?.orderId || '12345678')?.toString().slice(-8)}
              </Text>
            </View>

            {timeRemaining > 0 && (
              <View style={[styles.timerRow, styles.detailRow]}>
                <Icon name="time-outline" size={16} color={branding.cartDeleteColor} />
                <Text style={[styles.timerText, { color: branding.cartDeleteColor }]}>
                  Expires in: {formatTime(timeRemaining)}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Status */}
          <View style={styles.statusContainer}>
            {isMonitoring && (
              <>
                <ActivityIndicator size="small" color={branding.primaryColor} />
                <Text style={[styles.statusText, { color: branding.textColor }]}>
                  Waiting for payment...
                </Text>
              </>
            )}
          </View>

          {/* Demo Payment Success Button (for testing without backend) */}
          {__DEV__ && isMonitoring && (
            <TouchableOpacity 
              style={[styles.testSuccessButton, { backgroundColor: branding.cartDiscountColor }]}
              onPress={() => onConfirmCashPayment('Demo payment success')}
            >
              <Icon name="checkmark-circle" size={16} color={branding.whiteColorText} />
              <Text style={[styles.testSuccessText, { color: branding.whiteColorText }]}>
                Simulate Payment Success
              </Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cashButton, { backgroundColor: branding.secondaryBackground }]}
              onPress={handleCashPayment}
            >
              <Icon name="cash-outline" size={20} color={branding.primaryColor} />
              <Text style={[styles.cashButtonText, { color: branding.primaryColor }]}>
                Cash Payment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: branding.cartDeleteColor }]}
              onPress={onClose}
            >
              <Icon name="close" size={20} color={branding.whiteColorText} />
              <Text style={[styles.cancelButtonText, { color: branding.whiteColorText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: branding.backgroundColor }]}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={branding.textColor} />
          </TouchableOpacity>

          {renderQRCodeContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: height * 0.85,
    width: width * 0.9,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    width: '100%',
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    marginTop: 16,
  },
  paymentContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  qrInstructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  orText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
  },
  paymentDetails: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  timerRow: {
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cashButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  cashButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  continueButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expiredContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  expiredTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 16,
  },
  expiredMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  paymentLinkText: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  paymentInstructions: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  testSuccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  testSuccessText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QRPaymentModal;
