# Login Flow Implementation Guide

## Overview

This guide covers the complete end-to-end OTP-based authentication flow from frontend to backend.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │──────│  API Client  │──────│   Backend   │
│  (Next.js)  │      │   (Axios)    │      │  (NestJS)   │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │                      │
       │  1. Enter Phone     │                      │
       │──────────────────────────────────────────→ │
       │                     │   POST /auth/send-otp│
       │                     │                      │
       │  2. OTP Generated   │                      │
       │←──────────────────────────────────────────┤
       │     (logged to console)                    │
       │                     │                      │
       │  3. Enter OTP       │                      │
       │──────────────────────────────────────────→ │
       │                     │ POST /auth/verify-otp│
       │                     │                      │
       │  4. Cookies Set     │                      │
       │←──────────────────────────────────────────┤
       │     (access_token, refresh_token)          │
       │                     │                      │
       │  5. Redirect Home   │                      │
       └─────────────────────┘                      │
```

## Flow Steps

### Step 1: User Enters Phone Number

**Frontend:** `client-app/src/app/patient/login/components/LoginForm.tsx`

1. User enters 10-digit phone number
2. Client validates format (digits only, 10 chars)
3. Calls `sendOtp(phone)` from useAuth hook
4. Phone stored in sessionStorage
5. Redirects to `/patient/verify-otp`

**Backend:** `POST /auth/send-otp`

1. Validates phone number format (10-15 digits)
2. Checks rate limiting (3 OTPs per 15 minutes)
3. Generates 6-digit OTP using `crypto.randomInt`
4. Hashes OTP with bcrypt before storing
5. Stores in `otp_verifications` table with 5-minute expiry
6. **Currently:** Logs OTP to console (SMS integration pending)
7. Returns success message and expiry time

### Step 2: User Enters OTP

**Frontend:** `client-app/src/app/patient/verify-otp/VerifyOtpPageView.tsx`

1. User enters 6-digit OTP
2. Auto-focuses next input on digit entry
3. Supports paste functionality
4. Calls `verifyOtp(phone, otp)` on submit
5. On success: Clears sessionStorage and redirects to `/patient/home`
6. On error: Displays error message and clears OTP fields

**Backend:** `POST /auth/verify-otp`

1. Validates OTP format (6 digits)
2. Checks OTP exists and not expired
3. Verifies OTP hash matches (max 3 attempts)
4. Finds or creates user by phone number
5. Generates JWT access token (15min) and refresh token (30d)
6. **Sets HTTP-only cookies:**
   - `access_token` (httpOnly, secure, sameSite: lax)
   - `refresh_token` (httpOnly, secure, sameSite: lax)
7. Stores refresh token hash in `refresh_tokens` table
8. Returns user info (no tokens in response body)

### Step 3: Automatic Token Refresh

**When:** Any API call returns 401 Unauthorized

**Axios Interceptor:** Automatically triggered

1. Intercepts 401 response
2. Calls `POST /auth/refresh` (cookies sent automatically)
3. Backend reads `refresh_token` cookie
4. Validates and verifies refresh token
5. Generates new access token
6. **Rotates refresh token** (creates new one, revokes old)
7. Sets new cookies
8. Retries original failed request
9. If refresh fails: Redirects to `/patient/login`

### Step 4: Protected Routes

**Example:** Any authenticated API call

```typescript
// Automatic - cookies sent with every request
const appointments = await apiClient.get('/appointments');
```

Backend JWT Guard:
1. Reads `access_token` from cookie
2. Verifies JWT signature and expiry
3. Attaches user payload to request
4. If invalid: Returns 401 (triggers auto-refresh)

## File Structure

### Frontend Files

```
client-app/src/
├── lib/
│   └── api-client.ts                 # Axios client with interceptor
├── hooks/
│   └── useAuth.ts                    # Auth hook
├── contexts/
│   └── AuthContext.tsx               # Auth state management
├── types/
│   └── auth.types.ts                 # TypeScript types
└── app/patient/
    ├── login/
    │   ├── page.tsx
    │   ├── LoginPageView.tsx
    │   └── components/
    │       └── LoginForm.tsx         # Phone number form
    └── verify-otp/
        ├── page.tsx
        ├── VerifyOtpPageView.tsx     # OTP verification logic
        └── components/
            └── VerifyOtpForm.tsx     # OTP input UI
```

### Backend Files

```
medi-service/src/
├── main.ts                          # Cookie parser setup
├── auth/
│   ├── controllers/
│   │   └── auth.controller.ts       # REST endpoints
│   ├── services/
│   │   ├── otp.service.ts           # OTP generation/verification
│   │   └── auth.service.ts          # Token management
│   ├── guards/
│   │   └── jwt-auth.guard.ts        # Cookie-based JWT guard
│   ├── dto/
│   │   ├── send-otp.dto.ts          # { phone: string }
│   │   └── verify-otp.dto.ts        # { phone: string, otp: string }
│   └── types/
│       └── auth.types.ts            # TypeScript types
└── db/migrations/
    └── 009_otp_auth.sql             # Database tables
```

## Testing the Flow

### Prerequisites

1. **Start PostgreSQL:**
   ```bash
   # Ensure PostgreSQL is running on localhost:5432
   ```

2. **Run Database Migrations:**
   ```bash
   cd medi-service
   # Update .env: RUN_MIGRATIONS=true
   pnpm run start:dev
   # Or manually: pnpm db:migrate
   ```

3. **Start Backend:**
   ```bash
   cd medi-service
   pnpm run start:dev
   # Server runs on http://localhost:3001
   ```

4. **Start Frontend:**
   ```bash
   cd client-app
   pnpm run dev
   # Client runs on http://localhost:3000
   ```

### Test Steps

1. **Navigate to Login:**
   ```
   http://localhost:3000/patient/login
   ```

2. **Enter Phone Number:**
   ```
   Phone: 9876543210
   Click "Get One-Time Password"
   ```

3. **Check Backend Console:**
   ```
   🔐 OTP for 9876543210: 123456 (expires in 5 minutes)
   ```

4. **Enter OTP:**
   ```
   Navigate to: http://localhost:3000/patient/verify-otp
   Enter the 6-digit OTP from console
   Click "Verify & Proceed"
   ```

5. **Check Browser Cookies:**
   ```
   DevTools > Application > Cookies > http://localhost:3000
   Should see:
   - access_token (HttpOnly)
   - refresh_token (HttpOnly)
   ```

6. **Verify Login:**
   ```
   Should redirect to: http://localhost:3000/patient/home
   User is now authenticated
   ```

### Test Auto-Refresh

1. **Wait 15 minutes** (or modify JWT_ACCESS_EXPIRY to 30s in .env)
2. **Make any API call** (or navigate to protected page)
3. **Check Network Tab:**
   - First request fails with 401
   - Auto-refresh call to `/auth/refresh`
   - Original request retried and succeeds
   - All transparent to user!

## API Endpoints

### POST /auth/send-otp

**Request:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresAt": "2026-01-10T12:35:00.000Z"
}
```

**Console Output:**
```
🔐 OTP for 9876543210: 123456 (expires in 5 minutes)
```

### POST /auth/verify-otp

**Request:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "user_id": "uuid",
    "phone_number": "9876543210",
    "role": "PATIENT",
    "is_active": true
  }
}
```

**Cookies Set:**
- `access_token` (15 min)
- `refresh_token` (30 days)

### POST /auth/refresh

**Request:** No body (cookies sent automatically)

**Response:**
```json
{
  "success": true
}
```

**Cookies Updated:**
- `access_token` (new, 15 min)
- `refresh_token` (rotated, 30 days)

### POST /auth/logout

**Request:** No body (cookies sent automatically)

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `access_token`
- `refresh_token`

### GET /auth/me

**Request:** No body (cookies sent automatically)

**Response:**
```json
{
  "user": {
    "user_id": "uuid",
    "phone_number": "9876543210",
    "role": "PATIENT",
    "is_active": true
  }
}
```

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=root
DB_NAME=mediworld_db

# Server
NODE_ENV=development
APP_PORT=3001
CLIENT_URL=http://localhost:3000

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your_secret_here_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=different_secret_here_min_32_chars
JWT_REFRESH_EXPIRY=30d

# SMS (currently console mode)
SMS_PROVIDER=console
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Database Schema

### otp_verifications

```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### refresh_tokens

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  replaced_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Features

### OTP Security

- ✅ Rate limiting: 3 OTPs per 15 minutes per phone
- ✅ Hashed storage: bcrypt with salt
- ✅ Expiry: 5 minutes
- ✅ Max attempts: 3 verification attempts
- ✅ Auto-cleanup: Expired OTPs deleted automatically

### Token Security

- ✅ HTTP-only cookies: XSS protection
- ✅ SameSite: lax (CSRF protection)
- ✅ Secure flag: HTTPS only in production
- ✅ Short expiry: 15 minutes for access token
- ✅ Refresh rotation: New token on each refresh
- ✅ Revocation support: Session management
- ✅ Device tracking: IP and user agent stored

### Request Security

- ✅ CORS configured: Only frontend origin allowed
- ✅ Validation: DTO validation on all inputs
- ✅ Credentials: withCredentials required
- ✅ Auto-refresh: Seamless token renewal

## Troubleshooting

### Issue: OTP not received

**Solution:** Check backend console for OTP (SMS not yet integrated)
```
🔐 OTP for 9876543210: 123456 (expires in 5 minutes)
```

### Issue: "Invalid OTP" error

**Possible causes:**
1. OTP expired (5 min limit)
2. Wrong OTP entered
3. Exceeded 3 attempts
4. Clock skew between client/server

**Solution:** Request new OTP (resend button)

### Issue: Cookies not being set

**Check:**
1. Backend running on port 3001
2. Frontend running on port 3000
3. CORS configured correctly (CLIENT_URL=http://localhost:3000)
4. Browser allows cookies (not in incognito with strict settings)

### Issue: 401 errors on protected routes

**Check:**
1. Cookies exist (DevTools > Application > Cookies)
2. Cookies not expired
3. Backend can read cookies (cookie-parser installed)
4. JWT secrets match in .env

### Issue: Auto-refresh not working

**Check:**
1. Axios interceptor configured (api-client.ts)
2. Refresh endpoint returns 200
3. New cookies are set
4. Network tab shows refresh call

## Next Steps

1. **Integrate Real SMS Provider:**
   ```bash
   # Install Twilio
   pnpm add twilio
   
   # Update .env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

2. **Generate Strong JWT Secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Protect More Routes:**
   ```typescript
   // Add JWT guard
   @UseGuards(JwtAuthGuard)
   @Get('appointments')
   async getAppointments(@Req() req: any) {
     const userId = req.user.user_id;
     // ...
   }
   ```

4. **Add Role-Based Access:**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(UserRole.DOCTOR)
   @Get('patients')
   async getPatients() {
     // Only doctors can access
   }
   ```

## Production Checklist

- [ ] Generate strong JWT secrets (64 bytes)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (secure cookies require it)
- [ ] Integrate real SMS provider
- [ ] Set proper CORS origins (no wildcards)
- [ ] Enable rate limiting on all endpoints
- [ ] Set up monitoring for failed login attempts
- [ ] Implement account lockout after N failed attempts
- [ ] Add email notifications for new logins
- [ ] Set up session timeout warnings
- [ ] Test auto-refresh under load
- [ ] Add 2FA option for sensitive operations
