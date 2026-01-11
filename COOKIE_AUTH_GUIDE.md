# HTTP-Only Cookie Authentication Guide

## Overview

The authentication system has been updated to use **HTTP-only cookies** instead of localStorage for enhanced security.

## Security Benefits

### Why HTTP-Only Cookies?

1. **XSS Protection**: JavaScript cannot access HTTP-only cookies, preventing XSS attacks from stealing tokens
2. **CSRF Protection**: Combined with SameSite attribute, provides CSRF protection
3. **Automatic Management**: Browser handles cookie storage and transmission
4. **Secure Flag**: In production, cookies are only sent over HTTPS

## Changes Made

### Client-Side (Next.js)

1. **[src/lib/api-client.ts](client-app/src/lib/api-client.ts)**
   - Removed all localStorage logic
   - Removed token management methods (setTokens, clearTokens, getTokens)
   - Added `credentials: 'include'` to all fetch requests
   - Cookies are now sent automatically by the browser

2. **[src/contexts/AuthContext.tsx](client-app/src/contexts/AuthContext.tsx)**
   - Removed token state management
   - Server sets cookies automatically on verify-otp
   - Logout clears cookies on server-side

3. **[src/types/auth.types.ts](client-app/src/types/auth.types.ts)**
   - AuthState.tokens is now optional (null with cookies)
   - VerifyOtpResponse no longer returns tokens in body

### Backend (NestJS)

1. **[src/main.ts](medi-service/src/main.ts)**
   - Added cookie-parser middleware
   - CORS configured with `credentials: true`

2. **[src/auth/controllers/auth.controller.ts](medi-service/src/auth/controllers/auth.controller.ts)**
   - **verify-otp**: Sets access_token and refresh_token cookies
   - **refresh**: Reads refresh_token from cookie, sets new cookies
   - **logout**: Reads refresh_token from cookie, clears both cookies

3. **[src/auth/guards/jwt-auth.guard.ts](medi-service/src/auth/guards/jwt-auth.guard.ts)**
   - Reads access_token from cookies instead of Authorization header

## Cookie Configuration

### Access Token Cookie
```typescript
{
  httpOnly: true,              // Cannot be accessed by JavaScript
  secure: true,                // Only sent over HTTPS (production)
  sameSite: 'lax',            // CSRF protection
  maxAge: 15 * 60 * 1000      // 15 minutes
}
```

### Refresh Token Cookie
```typescript
{
  httpOnly: true,              // Cannot be accessed by JavaScript
  secure: true,                // Only sent over HTTPS (production)
  sameSite: 'lax',            // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
}
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production          # Set to 'production' for secure cookies
CLIENT_URL=http://localhost:3000  # Must match client origin for CORS
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Usage Examples

### Login Flow
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { sendOtp, verifyOtp } = useAuth();

  // Send OTP
  await sendOtp('+1234567890');

  // Verify OTP - cookies set automatically by backend
  await verifyOtp('+1234567890', '123456');
  
  // That's it! Tokens are now in HTTP-only cookies
}
```

### Making Authenticated Requests
```typescript
import { apiClient } from '@/lib/api-client';

// Cookies are sent automatically
const data = await apiClient.get('/appointments', {
  requiresAuth: true
});
```

### Automatic Token Refresh
```typescript
// ApiClient handles this automatically:
// 1. Request fails with 401
// 2. Calls POST /auth/refresh (refresh_token cookie sent automatically)
// 3. Backend sets new cookies
// 4. Retries original request
// 5. All transparent to the user
```

### Logout
```typescript
const { logout } = useAuth();

// Clears cookies on backend
await logout();
```

## API Endpoints

### POST /auth/verify-otp
**Request:**
```json
{
  "phone_number": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": { ... }
}
```

**Cookies Set:**
- `access_token` (15 min)
- `refresh_token` (30 days)

### POST /auth/refresh
**Request:** No body needed (cookies sent automatically)

**Response:**
```json
{
  "success": true
}
```

**Cookies Set:**
- `access_token` (new, 15 min)
- `refresh_token` (new, 30 days)

### POST /auth/logout
**Request:** No body needed (cookies sent automatically)

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

## Production Checklist

- [ ] Set `NODE_ENV=production` on backend
- [ ] Use HTTPS in production (secure cookies require it)
- [ ] Set correct `CLIENT_URL` in backend .env
- [ ] Verify CORS configuration allows your frontend domain
- [ ] Test cookie settings work across domains if needed
- [ ] Consider using `sameSite: 'strict'` for extra security if your app doesn't need cross-site requests

## Migration from localStorage

If you have existing users with localStorage tokens:

1. They will be logged out after the update (expected behavior)
2. Users need to re-authenticate with OTP
3. New HTTP-only cookies will be set
4. No data loss - all sessions are in the database

## Troubleshooting

### Cookies not being sent from client
- Verify `credentials: 'include'` is set in fetch requests
- Check CORS configuration allows credentials
- Ensure client and server domains match (or use proper CORS setup)

### Cookies not being set by server
- Check `res.cookie()` is being called
- Verify cookie-parser middleware is installed
- Check browser DevTools > Application > Cookies

### 401 Errors on protected routes
- Verify cookie is present in request (DevTools > Network > Request Headers)
- Check cookie name matches (`access_token`)
- Verify JWT guard is reading from cookies

### Refresh not working
- Check `refresh_token` cookie is being sent
- Verify backend is reading from `req.cookies.refresh_token`
- Check token hasn't expired (30 days max)

## Security Best Practices

1. **Always use HTTPS in production** - Secure flag only works over HTTPS
2. **Set short access token expiry** - Currently 15 minutes
3. **Rotate refresh tokens** - Backend already implements this
4. **Monitor for suspicious sessions** - Use the session management endpoints
5. **Set appropriate CORS origins** - Don't use wildcards in production
6. **Consider SameSite=strict** - If your app doesn't need cross-site requests

## Comparison: localStorage vs HTTP-Only Cookies

| Feature | localStorage | HTTP-Only Cookies |
|---------|--------------|-------------------|
| XSS Protection | ❌ Vulnerable | ✅ Protected |
| CSRF Protection | ✅ Not applicable | ✅ With SameSite |
| Storage Location | Client JS | Browser only |
| Automatic Transmission | ❌ Manual | ✅ Automatic |
| Cross-domain Support | ✅ Easy | ⚠️ Requires CORS |
| Developer Tools Access | ✅ Visible | ✅ Visible |
| JavaScript Access | ✅ Full | ❌ None |

## Related Files

### Client-Side
- [src/lib/api-client.ts](client-app/src/lib/api-client.ts) - HTTP client with cookie support
- [src/contexts/AuthContext.tsx](client-app/src/contexts/AuthContext.tsx) - Auth state management
- [src/hooks/useAuth.ts](client-app/src/hooks/useAuth.ts) - Auth hook
- [src/types/auth.types.ts](client-app/src/types/auth.types.ts) - TypeScript types

### Backend
- [src/main.ts](medi-service/src/main.ts) - Cookie parser setup
- [src/auth/controllers/auth.controller.ts](medi-service/src/auth/controllers/auth.controller.ts) - Cookie management
- [src/auth/guards/jwt-auth.guard.ts](medi-service/src/auth/guards/jwt-auth.guard.ts) - Cookie reading
- [src/auth/services/auth.service.ts](medi-service/src/auth/services/auth.service.ts) - Token logic
