'use client';

import React, { createContext, useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import type {
  AuthState,
  SendOtpResponse,
  VerifyOtpResponse,
  User,
  Session,
} from '@/types/auth.types';

interface AuthContextType extends AuthState {
  // Authentication actions
  sendOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Session management
  getSessions: () => Promise<Session[]>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Idle timeout configuration - use ref to avoid circular dependency
  const IDLE_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== Authentication Actions ====================

  const sendOtp = useCallback(async (phone: string): Promise<SendOtpResponse> => {
    const response = await apiClient.post<SendOtpResponse>('/auth/send-otp', { phone });
    return response.data;
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string): Promise<void> => {
    const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', {
      phone,
      otp,
    });

    // Tokens are now in HTTP-only cookies, just update user state
    setState({
      user: response.data.user,
      tokens: null, // Not needed with cookies
      isLoading: false,
      isAuthenticated: true,
    });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout endpoint (cookies will be cleared by server)
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      });
      // Redirect to login page
      router.push('/patient/login');
    }
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      setState((prev) => ({
        ...prev,
        user: response.data,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Clear auth state on error
      setState({
        user: null,
        tokens: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // ==================== Session Management ====================

  const getSessions = useCallback(async (): Promise<Session[]> => {
    const response = await apiClient.get<Session[]>('/auth/sessions');
    return response.data;
  }, []);

  const deleteSession = useCallback(async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  }, []);

  // ==================== Idle Timeout ====================

  const resetIdleTimer = useCallback(() => {
    // Clear existing timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    // Only set timer if user is authenticated
    if (state.isAuthenticated) {
      idleTimerRef.current = setTimeout(() => {
        console.log('Session expired due to inactivity');
        logout();
      }, IDLE_TIMEOUT);
    }
  }, [state.isAuthenticated, logout, IDLE_TIMEOUT]);

  // Track user activity
  useEffect(() => {
    if (!state.isAuthenticated) {
      // Clear timer if user is not authenticated
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    const handleActivity = () => {
      resetIdleTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetIdleTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [state.isAuthenticated, resetIdleTimer]);

  // ==================== Initialization ====================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to fetch current user (cookies will be sent automatically)
        const response = await apiClient.get<User>('/auth/me');
        
        setState({
          user: response.data,
          tokens: null, // Not needed with cookies
          isLoading: false,
          isAuthenticated: true,
        });
      } catch (error) {
        // No valid session
        setState({
          user: null,
          tokens: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // ==================== Context Value ====================

  const value: AuthContextType = {
    ...state,
    sendOtp,
    verifyOtp,
    logout,
    refreshUser,
    getSessions,
    deleteSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
