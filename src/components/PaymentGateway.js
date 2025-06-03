import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { API_URL } from '../config';

const PaymentGateway = ({ amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      const response = await axios.post(`${API_URL}/payment/process`, {
        amount: amount,
      });
      setOrderId(response.data.order.id);
      setLoading(false);
    } catch (error) {
      onError(error.message);
    }
  };

  const getRazorpayHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            var options = {
              key: "${process.env.RAZORPAY_KEY_ID}",
              amount: "${amount * 100}",
              currency: "INR",
              name: "Your Company Name",
              description: "Payment for your order",
              order_id: "${orderId}",
              handler: function (response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment_success',
                  data: response
                }));
              },
              prefill: {
                name: "Customer Name",
                email: "customer@example.com",
                contact: "9999999999"
              },
              theme: {
                color: "#3399cc"
              }
            };
            var rzp = new Razorpay(options);
            rzp.open();
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'payment_success') {
        const verifyResponse = await axios.post(`${API_URL}/payment/verify`, {
          razorpay_order_id: data.data.razorpay_order_id,
          razorpay_payment_id: data.data.razorpay_payment_id,
          razorpay_signature: data.data.razorpay_signature,
        });
        
        if (verifyResponse.data.success) {
          onSuccess(data.data);
        } else {
          onError('Payment verification failed');
        }
      }
    } catch (error) {
      onError(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: getRazorpayHTML() }}
        onMessage={handleWebViewMessage}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 500,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentGateway; 