# Payment Module

Polymorphic payment system supporting multiple payment types (appointments, medicine orders, lab tests, etc.).

## API Endpoints

### Create Payment
```http
POST /payments
Content-Type: application/json

{
  "reference_type": "APPOINTMENT",
  "reference_id": "uuid-of-appointment",
  "patient_id": "uuid-of-patient",
  "amount": 200,
  "currency": "INR",
  "payment_type": "BOOKING_FEE",
  "metadata": {
    "items": [],
    "meta": []
  }
}
```

### Get Payment Intent (for payment page)
```http
GET /payments/:id/intent

Response:
{
  "id": "payment-uuid",
  "purpose": "BOOKING_FEE",
  "reference_id": "appointment-uuid",
  "amount": 200,
  "currency": "INR",
  "status": "CREATED",
  "context": {
    "title": "Doctor Consultation",
    "subtitle": "Dr. Emily Chen · Cardiologist",
    "meta": [...],
    "items": [...],
    "policyTitle": "...",
    "policyText": "..."
  }
}
```

### Update Payment (after gateway callback)
```http
PATCH /payments/:id

{
  "status": "SUCCESS",
  "payment_method": "UPI",
  "provider": "RAZORPAY",
  "provider_order_id": "order_xyz",
  "provider_payment_id": "pay_abc"
}
```

### Get Payments by Reference
```http
GET /payments/reference/:referenceType/:referenceId

Example: GET /payments/reference/APPOINTMENT/apt-123
```

### Get Patient Payments
```http
GET /payments/patient/:patientId
```

## Payment Types

- **APPOINTMENT**: `BOOKING_FEE`, `CONSULTATION_FEE`
- **MEDICINE_ORDER**: `MEDICINE`
- **LAB_TEST**: `DIAGNOSTIC`
- **SUBSCRIPTION**: `SUBSCRIPTION`

## Reference Types

- `APPOINTMENT` - Links to appointments table
- `MEDICINE_ORDER` - Links to medicine orders table
- `LAB_TEST` - Links to lab tests table
- `CONSULTATION` - Links to teleconsultation sessions
- `SUBSCRIPTION` - Links to subscription plans

## Payment Flow

1. **Create Payment** → Backend creates payment record with `CREATED` status
2. **Get Payment Intent** → Client fetches payment details for display
3. **User Pays** → Frontend initiates payment gateway (Razorpay/Stripe)
4. **Gateway Callback** → Backend receives webhook, updates payment status
5. **Update Payment** → Backend marks payment as `SUCCESS`/`FAILED`

## Database Schema

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  reference_type VARCHAR(40) NOT NULL,  -- APPOINTMENT / MEDICINE_ORDER / LAB_TEST
  reference_id UUID NOT NULL,           -- UUID of the entity
  patient_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(5) DEFAULT 'INR',
  payment_type VARCHAR(40) NOT NULL,
  payment_method VARCHAR(40),           -- UPI / CARD / NET_BANKING
  provider VARCHAR(40),                 -- RAZORPAY / STRIPE
  provider_order_id VARCHAR(255),
  provider_payment_id VARCHAR(255),
  status VARCHAR(30) NOT NULL,          -- CREATED / SUCCESS / FAILED
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
