'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
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
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
  });

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
    }
  }, []);

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
