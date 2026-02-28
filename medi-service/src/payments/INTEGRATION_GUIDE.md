# Payment Gateway Integration - Complete Guide

## Overview
Full-featured payment module with Razorpay & Stripe integration, webhook handlers, and refund support.

## 🚀 New Features Added

### 1. Payment Gateway Services
- **Razorpay Gateway** ([razorpay-gateway.service.ts](medi-service/src/payments/services/razorpay-gateway.service.ts))
  - Order creation
  - Signature verification
  - Webhook signature verification
  - Payment fetch
  - Refund processing

- **Stripe Gateway** ([stripe-gateway.service.ts](medi-service/src/payments/services/stripe-gateway.service.ts))
  - PaymentIntent creation
  - Payment confirmation
  - Payment cancellation
  - Refund processing
  - Webhook event verification

### 2. Webhook Handlers
- **Webhook Service** ([webhook.service.ts](medi-service/src/payments/services/webhook.service.ts))
  - Razorpay events: `payment.authorized`, `payment.captured`, `payment.failed`, `refund.processed`
  - Stripe events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
  - Auto-updates payment status in database

- **Webhook Controller** ([webhook.controller.ts](medi-service/src/payments/controllers/webhook.controller.ts))
  - `POST /webhooks/razorpay` - Razorpay webhook endpoint
  - `POST /webhooks/stripe` - Stripe webhook endpoint
  - Signature verification for security

### 3. Enhanced Payment Controller
- `POST /payments/initiate` - Create gateway order/intent
- `POST /payments/verify` - Verify Razorpay payment signature
- `POST /payments/:id/refund` - Initiate refund (full or partial)

### 4. New DTOs
- `InitiatePaymentDto` - Start payment with chosen provider
- `VerifyPaymentDto` - Razorpay signature verification
- `RefundPaymentDto` - Refund with amount, reason, notes

## 📋 API Endpoints

### Payment Flow

#### 1. Create Payment
```http
POST /payments
{
  "reference_type": "APPOINTMENT",
  "reference_id": "apt-uuid",
  "patient_id": "patient-uuid",
  "amount": 200,
  "payment_type": "BOOKING_FEE"
}

Response: { id: "payment-uuid", status: "CREATED", ... }
```

#### 2. Get Payment Intent (for UI)
```http
GET /payments/{payment-uuid}/intent

Response: {
  id, purpose, amount, currency, status,
  context: { title, subtitle, meta, items, policy }
}
```

#### 3. Initiate Payment
```http
POST /payments/initiate
{
  "payment_id": "payment-uuid",
  "provider": "RAZORPAY"
}

Razorpay Response:
{
  "success": true,
  "provider": "RAZORPAY",
  "order_id": "order_xyz",
  "amount": 20000,
  "key": "rzp_test_..."
}

Stripe Response:
{
  "success": true,
  "provider": "STRIPE",
  "client_secret": "pi_xxx_secret_yyy",
  "payment_intent_id": "pi_xxx"
}
```

#### 4. Verify Payment (Razorpay only)
```http
POST /payments/verify
{
  "payment_id": "payment-uuid",
  "provider_order_id": "order_xyz",
  "provider_payment_id": "pay_abc",
  "signature": "hash"
}
```

#### 5. Refund Payment
```http
POST /payments/{payment-uuid}/refund
{
  "amount": 100,  // Optional: omit for full refund
  "reason": "Customer request"
}
```

### Webhook Endpoints

```http
POST /webhooks/razorpay
Headers: x-razorpay-signature

POST /webhooks/stripe
Headers: stripe-signature
```

## 🔧 Setup Instructions

### 1. Environment Variables
Add to `.env`:
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Configure Webhooks

**Razorpay:**
1. Dashboard → Settings → Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/razorpay`
3. Select events: payment.authorized, payment.captured, payment.failed, refund.processed
4. Copy webhook secret to `.env`

**Stripe:**
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
4. Copy signing secret to `.env`

### 3. Test Locally (with ngrok)
```bash
# Start ngrok
ngrok http 8080

# Update webhook URLs with ngrok URL
# Razorpay: https://xyz.ngrok.io/webhooks/razorpay
# Stripe: https://xyz.ngrok.io/webhooks/stripe
```

## 💳 Payment Flows

### Razorpay Flow
```
1. Create Payment (status: CREATED)
2. Initiate Payment → get order_id + key
3. Client: Open Razorpay checkout modal
4. User completes payment
5. Client: Call /payments/verify with signature
6. Webhook: payment.captured → status: SUCCESS
```

### Stripe Flow
```
1. Create Payment (status: CREATED)
2. Initiate Payment → get client_secret
3. Client: Use Stripe Elements/Checkout
4. User completes payment
5. Webhook: payment_intent.succeeded → status: SUCCESS
```

## 🔄 Refund Flow
```
1. POST /payments/:id/refund
2. Gateway processes refund
3. Webhook: refund.processed / charge.refunded
4. Payment status → REFUNDED
```

## 📊 Payment Status States
- `CREATED` - Payment record created, awaiting gateway initiation
- `PENDING` - Payment authorized, awaiting capture
- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded (full or partial)

## 🧪 Testing

### Test Cards

**Razorpay:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`
- CVV: any 3 digits, Expiry: any future date

**Stripe:**
- Success: `4242 4242 4242 4242`
- Failure: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 📦 Files Created

### Services
- `razorpay-gateway.service.ts` - Razorpay SDK wrapper
- `stripe-gateway.service.ts` - Stripe SDK wrapper
- `webhook.service.ts` - Webhook event processing

### Controllers
- `webhook.controller.ts` - Webhook endpoints

### DTOs
- `initiate-payment.dto.ts`
- `verify-payment.dto.ts`
- `refund-payment.dto.ts`

### Updated
- `payment.controller.ts` - Added initiate, verify, refund endpoints
- `payment.service.ts` - Added helper methods for webhooks
- `payment.module.ts` - Registered all services
- `.env` - Added gateway credentials

## 🔒 Security Features
- Webhook signature verification (both providers)
- Environment-based credential management
- No credentials exposed in responses
- Automatic status reconciliation via webhooks

## 📝 Next Steps
1. Add transaction logs table for audit trail
2. Implement retry logic for failed webhooks
3. Add payment analytics dashboard
4. Support for partial refunds tracking
5. Email notifications for payment events
