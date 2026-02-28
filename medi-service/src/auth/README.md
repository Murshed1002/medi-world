# OTP-Based Authentication System

Complete passwordless authentication using OTP verification with JWT tokens.

## 🔐 Authentication Flow

### 1. Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "phone_number": "9876543210"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Features:**
- Rate limiting: Max 3 OTP requests per 15 minutes
- 6-digit cryptographically secure OTP
- 5-minute expiry
- OTP hashed before storage (bcrypt)

### 2. Verify OTP & Login
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone_number": "9876543210",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "Authentication successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "64-char-hex-string",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "phone_number": "9876543210",
    "email": null,
    "role": "PATIENT"
  }
}
```

**Features:**
- Auto-creates user on first login (PATIENT role)
- Max 3 verification attempts per OTP
- JWT access token (15 min)
- Refresh token (30 days)
- Tracks IP, user agent, device info

### 3. Refresh Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}

Response:
{
  "success": true,
  "access_token": "new-access-token",
  "refresh_token": "new-refresh-token",
  "expires_in": 900
}
```

**Features:**
- Refresh token rotation (old token revoked)
- Links old → new token for audit trail

### 4. Get Current User
```http
GET /auth/me
Headers:
  Authorization: Bearer <access_token>

Response:
{
  "user": {
    "user_id": "uuid",
    "phone_number": "9876543210",
    "role": "PATIENT"
  }
}
```

### 5. Logout
```http
POST /auth/logout
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 6. Get Active Sessions
```http
GET /auth/sessions
Headers:
  Authorization: Bearer <access_token>

Response:
{
  "sessions": [
    {
      "session_id": "uuid",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "device_info": {...},
      "created_at": "2026-01-10T10:00:00Z",
      "expires_at": "2026-02-09T10:00:00Z"
    }
  ]
}
```

### 7. Revoke Session
```http
DELETE /auth/sessions/:sessionId
Headers:
  Authorization: Bearer <access_token>

Response:
{
  "success": true,
  "message": "Session revoked successfully"
}
```

## 🛡️ Security Features

### OTP Security
- ✅ Hashed storage (bcrypt)
- ✅ 5-minute expiry
- ✅ Rate limiting (3 per 15 min)
- ✅ Max 3 verification attempts
- ✅ One-time use (marked verified after use)

### Token Security
- ✅ JWT access tokens (stateless)
- ✅ Short-lived access tokens (15 min)
- ✅ Long-lived refresh tokens (30 days)
- ✅ Refresh token rotation
- ✅ Hashed refresh token storage
- ✅ Session tracking & revocation
- ✅ Device/IP tracking

### Request Guards
- **JwtAuthGuard** - Validates JWT access token
- **RolesGuard** - Checks user role permissions

## 📦 Files Created

### Migrations
- `009_otp_auth.sql` - OTP verifications & refresh tokens tables

### Services
- `otp.service.ts` - OTP generation, verification, SMS sending
- `auth.service.ts` - JWT tokens, user authentication, session management

### Controllers
- `auth.controller.ts` - Auth endpoints

### DTOs
- `send-otp.dto.ts` - Phone number validation
- `verify-otp.dto.ts` - OTP verification
- `refresh-token.dto.ts` - Token refresh

### Guards
- `jwt-auth.guard.ts` - Protects routes, validates JWT
- `roles.guard.ts` - Role-based access control

### Decorators
- `@CurrentUser()` - Extract user from request
- `@Roles()` - Specify required roles

### Types
- `auth.types.ts` - JWT payload, tokens, device info

## 🔧 Environment Setup

Add to `.env`:
```env
# JWT Secrets (use strong random strings)
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRY=30d

# SMS Provider
SMS_PROVIDER=console  # console/twilio/aws-sns
```

## 📱 SMS Integration

### Development (Console)
```env
SMS_PROVIDER=console
```
OTP logged to console.

### Twilio (Production)
```bash
pnpm add twilio
```

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### AWS SNS (Production)
```bash
pnpm add @aws-sdk/client-sns
```

```env
SMS_PROVIDER=aws-sns
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## 🔑 Usage Examples

### Protected Route
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  @Get()
  getMyAppointments(@CurrentUser('user_id') userId: string) {
    return `Appointments for user ${userId}`;
  }
}
```

### Role-Based Route
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from './auth/types/auth.types';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  getDashboard() {
    return 'Admin dashboard';
  }
}
```

## 📊 Database Schema

### otp_verifications
```sql
- id: UUID
- phone_number: VARCHAR(15)
- otp_hash: VARCHAR(255)
- attempts: INT (0-3)
- max_attempts: INT (3)
- expires_at: TIMESTAMP (5 min)
- verified: BOOLEAN
- ip_address, user_agent
```

### refresh_tokens
```sql
- id: UUID
- user_id: UUID (FK → auth_users)
- token_hash: VARCHAR(255)
- expires_at: TIMESTAMP (30 days)
- revoked: BOOLEAN
- replaced_by: UUID (token rotation)
- ip_address, user_agent, device_info
```

## 🧪 Testing Flow

1. **Send OTP**: `POST /auth/send-otp` with phone
2. **Check Console**: Copy 6-digit OTP from logs
3. **Verify**: `POST /auth/verify-otp` with phone + OTP
4. **Get Tokens**: Save `access_token` and `refresh_token`
5. **Use API**: `Authorization: Bearer {access_token}`
6. **Refresh**: `POST /auth/refresh` before token expires

## 🚀 Next Steps

1. Integrate real SMS provider (Twilio/AWS SNS)
2. Add phone number verification on signup
3. Implement 2FA for sensitive operations
4. Add email-based OTP as fallback
5. Rate limiting middleware at API level
6. OTP fraud detection (unusual patterns)
7. Session management dashboard for users
8. Webhook for auth events (login, logout)

## 🔒 Best Practices

✅ **Do:**
- Use HTTPS in production
- Rotate JWT secrets periodically
- Log authentication events
- Monitor failed attempts
- Implement account lockout after repeated failures
- Use secure random OTP generation
- Hash all sensitive data

❌ **Don't:**
- Log OTPs in production
- Use weak JWT secrets
- Store tokens in localStorage (use httpOnly cookies if possible)
- Allow unlimited OTP requests
- Skip rate limiting
