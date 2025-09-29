# QR Payment System for Delivery Man App

## Overview
This QR Payment system allows delivery personnel to collect payments from customers using QR codes for non-COD orders.

## Features
- **QR Code Generation**: Generate payment QR codes for orders
- **Real-time Payment Monitoring**: Monitor payment status in real-time
- **Manual Payment Confirmation**: Option to confirm cash payments manually
- **Payment Status Tracking**: Visual indicators for payment status
- **QR Code Expiration Handling**: Auto-regeneration of expired QR codes
- **Error Handling**: Comprehensive error handling and user feedback

## Components

### 1. useQRPayment Hook (`useQRPayment.js`)
Custom React hook that manages QR payment state and API interactions.

**Features:**
- QR code generation
- Payment status monitoring
- Manual payment confirmation
- Error handling
- State management

**Usage:**
```javascript
import useQRPayment from '../../ui/hooks/useQRPayment';

const {
  qrData,
  paymentStatus,
  loading,
  error,
  generateQRCode,
  confirmPaymentManually,
  isPaymentSucceeded
} = useQRPayment();
```

### 2. QRPaymentModal Component (`QRPaymentModal.js`)
Modal component that displays QR codes and handles payment interactions.

**Features:**
- QR code display
- Payment status indicators
- Timer for QR expiration
- Cash payment option
- Success/Error states

**Usage:**
```javascript
import QRPaymentModal from './QRPaymentModal';

<QRPaymentModal
  visible={isVisible}
  onClose={handleClose}
  qrData={qrData}
  paymentStatus={paymentStatus}
  onConfirmCashPayment={handleCashPayment}
/>
```

## API Integration

### Backend Endpoints Required:
1. `POST /v2/payment/generate-qr` - Generate QR code
2. `GET /v2/payment/status/:orderId` - Check payment status
3. `PUT /v2/payment/confirm-payment/:orderId` - Confirm manual payment

### API Configuration:
Update `src/config/api.js` to include the correct API base URL:
```javascript
export const API_URL = 'http://your-domain.com/v2'; // Replace with actual domain
```

## Integration in OrderDetailsScreen

### Key Changes Made:
1. **Import statements**: Added QR payment components
2. **State management**: Integrated QR payment hook
3. **Payment validation**: Check payment status before delivery confirmation
4. **UI components**: Added QR payment button and status indicators
5. **Modal integration**: Added QR payment modal

### Payment Flow:
1. **Non-COD Order Detection**: Automatically detects if order requires payment
2. **Payment Collection**: Shows "Collect Payment via QR" button
3. **QR Generation**: Generates QR code when button is pressed
4. **Payment Monitoring**: Monitors payment status every 5 seconds
5. **Payment Confirmation**: Updates UI when payment is received
6. **Delivery Confirmation**: Allows delivery confirmation only after payment

## Testing

### Test Scenarios:
1. **COD Orders**: Should not show QR payment options
2. **Non-COD Orders**: Should show QR payment button
3. **QR Generation**: Should generate QR code successfully
4. **Payment Success**: Should update UI when payment is received
5. **Payment Failure**: Should handle payment failures gracefully
6. **QR Expiration**: Should offer to regenerate expired QR codes
7. **Cash Payment**: Should allow manual cash payment confirmation

### Manual Testing:
1. Create a non-COD order
2. Navigate to OrderDetailsScreen
3. Verify QR payment button appears
4. Tap QR payment button
5. Verify QR code modal opens
6. Test cash payment option
7. Verify payment status updates

## Styling
All components use the app's branding system via `useAppBranding()` hook for consistent theming.

## Error Handling
- Network errors are handled gracefully
- User-friendly error messages
- Retry mechanisms for failed operations
- Fallback options for payment collection

## Security Considerations
- QR codes expire after a set time
- Payment verification through backend
- Secure token-based authentication
- Order ID validation

## Future Enhancements
- Offline payment recording
- Payment receipt generation
- Multiple QR code formats
- Integration with more payment gateways
- Payment analytics for delivery personnel
