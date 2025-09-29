import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config/api';
import axios from 'axios';

const useQRPayment = () => {
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, succeeded, failed, expired
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const monitoringIntervalRef = useRef(null);
  const currentOrderIdRef = useRef(null);

  // API Base URLs - Updated to match your backend
  const PAYMENT_API_BASE = `${API_URL}/payment`;

  // Get authentication headers
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  };

  // Generate QR Code for Payment
  const generateQRCode = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    setPaymentStatus('pending');
    currentOrderIdRef.current = orderId;

    try {
      const headers = await getAuthHeaders();
      console.log('Calling QR generation API:', `${PAYMENT_API_BASE}/generate-qr`);
      console.log('Request payload:', { orderId });
      console.log('Headers:', headers);
      
      const response = await axios.post(
        `${PAYMENT_API_BASE}/generate-qr`,
        { orderId },
        { headers }
      );
      console.log('QR Generation Response:', response);
      if (response.data.success) {
        // Process the response data to ensure proper formatting
        const qrResponseData = response.data.data;
        
        // Convert amount from paise to rupees for display
        const processedData = {
          ...qrResponseData,
          amount: qrResponseData.amount ? (qrResponseData.amount / 100) : qrResponseData.order_details?.total_amount,
          display_amount: qrResponseData.order_details?.total_amount || (qrResponseData.amount / 100)
        };
        
        console.log('Processed QR Data:', processedData);
        setQrData(processedData);
        startPaymentMonitoring(orderId);
        return {
          success: true,
          data: processedData
        };
      } else {
        throw new Error(response.data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('QR Generation Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate QR code';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check Payment Status
  const checkPaymentStatus = useCallback(async (orderId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(
        `${PAYMENT_API_BASE}/status/${orderId}`,
        { headers }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to check payment status');
      }
    } catch (error) {
      // Don't log 404 errors repeatedly - backend API not implemented yet
      if (error.response?.status !== 404) {
        console.error('Payment Status Check Error:', error);
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to check payment status'
      };
    }
  }, []);

  // Start Payment Monitoring
  const startPaymentMonitoring = useCallback((orderId) => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    setIsMonitoring(true);
    setPaymentStatus('processing');

    monitoringIntervalRef.current = setInterval(async () => {
      const statusResult = await checkPaymentStatus(orderId);
      
      if (statusResult.success) {
        const status = statusResult.data;
        
        if (status.payment_status === 'succeeded') {
          setPaymentStatus('succeeded');
          setIsMonitoring(false);
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        } else if (status.qr_expired) {
          setPaymentStatus('expired');
          setIsMonitoring(false);
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        } else if (status.payment_status === 'failed') {
          setPaymentStatus('failed');
          setIsMonitoring(false);
          clearInterval(monitoringIntervalRef.current);
          monitoringIntervalRef.current = null;
        }
      }
    }, 5000); // Check every 5 seconds
  }, [checkPaymentStatus]);

  // Stop Payment Monitoring
  const stopPaymentMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Manual Payment Confirmation (Cash, Card, etc.)
  const confirmPaymentManually = useCallback(async (orderId, paymentMethod = 'cash', notes = '') => {
    setLoading(true);
    setError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(
        `${PAYMENT_API_BASE}/confirm-payment/${orderId}`,
        {
          paymentMethod,
          notes
        },
        { headers }
      );

      if (response.data.success) {
        setPaymentStatus('succeeded');
        stopPaymentMonitoring();
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Manual Payment Confirmation Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm payment';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [stopPaymentMonitoring]);

  // Reset QR Payment State
  const resetQRPayment = useCallback(() => {
    stopPaymentMonitoring();
    setQrData(null);
    setPaymentStatus('pending');
    setError(null);
    setLoading(false);
    currentOrderIdRef.current = null;
  }, [stopPaymentMonitoring]);

  // Regenerate QR Code (for expired QR)
  const regenerateQRCode = useCallback(async () => {
    if (currentOrderIdRef.current) {
      return await generateQRCode(currentOrderIdRef.current);
    }
    return { success: false, message: 'No order ID available' };
  }, [generateQRCode]);

  // Set test QR data (for debugging)
  const setTestQRData = useCallback((testData) => {
    console.log('Setting test QR data in hook:', testData);
    setQrData(testData);
    setPaymentStatus('processing');
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    qrData,
    paymentStatus,
    loading,
    error,
    isMonitoring,
    
    // Actions
    generateQRCode,
    checkPaymentStatus,
    confirmPaymentManually,
    resetQRPayment,
    regenerateQRCode,
    stopPaymentMonitoring,
    setTestQRData,
    
    // Computed values
    isPaymentPending: paymentStatus === 'pending',
    isPaymentProcessing: paymentStatus === 'processing',
    isPaymentSucceeded: paymentStatus === 'succeeded',
    isPaymentFailed: paymentStatus === 'failed',
    isPaymentExpired: paymentStatus === 'expired',
    hasQRData: !!qrData,
  };
};

export default useQRPayment;
