# Authentication System - Client Implementation

## Overview

This directory contains the complete authentication system for the Next.js client app with automatic token refresh functionality.

## Architecture

### Components

1. **ApiClient** ([lib/api-client.ts](../lib/api-client.ts))
   - Singleton HTTP client with automatic token management
   - Proactive token refresh (refreshes 2 minutes before expiry)
   - Reactive token refresh (on 401 responses)
   - Token storage in localStorage

2. **AuthContext** ([contexts/AuthContext.tsx](../contexts/AuthContext.tsx))
   - React context for authentication state
   - Provides auth actions (sendOtp, verifyOtp, logout)
   - Session management
   - Automatic session restoration on app load

3. **useAuth Hook** ([hooks/useAuth.ts](../hooks/useAuth.ts))
   - Custom hook to access auth context
   - Type-safe authentication state and actions

## Usage Examples

### 1. Send OTP and Verify

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const { sendOtp, verifyOtp, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(phone, otp);
      // User is now authenticated, redirect or update UI
    } catch (error) {
      console.error('Failed to verify OTP:', error);
    }
  };

  if (isAuthenticated) {
    return <div>You are logged in!</div>;
  }

  return (
    <div>
      {!otpSent ? (
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
    </div>
  );
}
```

### 2. Protected Component

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedComponent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/patient/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user?.phone}!</h1>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 3. Making Authenticated API Calls

```tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // ApiClient automatically handles token refresh
        const data = await apiClient.get('/appointments', {
          requiresAuth: true,
        });
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div>
      {appointments.map((apt) => (
        <div key={apt.id}>{/* Render appointment */}</div>
      ))}
    </div>
  );
}
```

### 4. Logout

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/patient/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### 5. Session Management

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Session } from '@/types/auth.types';

export function SessionManager() {
  const { getSessions, deleteSession } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  return (
    <div>
      <h2>Active Sessions</h2>
      {sessions.map((session) => (
        <div key={session.id}>
          <p>{session.deviceInfo}</p>
          <p>{session.ipAddress}</p>
          <p>Last used: {new Date(session.lastUsedAt).toLocaleString()}</p>
          <button onClick={() => handleDeleteSession(session.id)}>
            Revoke
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Token Refresh Strategy

The ApiClient implements both **proactive** and **reactive** token refresh:

### Proactive Refresh
- Before making any authenticated request, checks if token expires in < 2 minutes
- Automatically refreshes token in the background
- Prevents 401 errors for active users

### Reactive Refresh
- If a request returns 401 Unauthorized
- Attempts to refresh the token
- Retries the original request with the new token
- Redirects to login if refresh fails

### Token Storage
- Tokens stored in localStorage
- Automatically loaded on app initialization
- Cleared on logout or refresh failure

## Environment Variables

Create a `.env.local` file in the client-app directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints Used

- `POST /auth/send-otp` - Send OTP to phone number
- `POST /auth/verify-otp` - Verify OTP and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke refresh token
- `GET /auth/me` - Get current user info
- `GET /auth/sessions` - Get all user sessions
- `DELETE /auth/sessions/:id` - Revoke a specific session

## Security Features

1. **JWT Tokens**
   - Access token: 15 minutes expiry
   - Refresh token: 30 days expiry
   - Stored securely in localStorage

2. **Automatic Token Refresh**
   - Reduces login friction
   - Maintains active sessions
   - Prevents unnecessary 401 errors

3. **Session Tracking**
   - Each login creates a tracked session
   - View and revoke sessions from any device
   - IP address and device info logged

4. **Refresh Token Rotation**
   - Backend replaces refresh token on each use
   - Prevents token replay attacks
   - Detects token theft

## Type Safety

All authentication types are defined in [types/auth.types.ts](../types/auth.types.ts):
- `User` - User profile
- `AuthTokens` - Access and refresh tokens
- `AuthState` - Authentication state
- `Session` - Active session info
- Response types for all auth operations

## Best Practices

1. **Always use `requiresAuth: true`** for authenticated endpoints
2. **Check `isLoading`** before rendering protected content
3. **Handle errors gracefully** with try-catch blocks
4. **Use `useEffect`** for redirects in protected routes
5. **Clear sensitive data** on logout
