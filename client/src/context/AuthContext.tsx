import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import {
  registerUserApi,
  loginUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  logoutApi,
  getMeApi
} from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'business_nexus_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialiseAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedUser && storedToken) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          try {
            const response = await getMeApi();
            setUser(response.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setUser(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialiseAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loginUserApi(email, password, role);
      setUser(response.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      toast.success('Successfully logged in');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await registerUserApi(name, email, password, role);
      setUser(response.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      toast.success('Account created successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      const response = await forgotPasswordApi(email);
      toast.success(response.message);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Forgot password request failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await resetPasswordApi(token, newPassword);
      toast.success(response.message);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Password reset failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // ignore API logout failure, clear client session anyway
    } finally {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
  void userId;
  void updates;
  toast.error('Profile update API not implemented yet');
  throw new Error('Profile update API not implemented yet');
};

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
