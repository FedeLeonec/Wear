import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, getUserProfile } from '../services/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (token) {
          setState(prev => ({ ...prev, token, isLoading: false }));
          loadUserProfile();
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadToken();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setState(prev => ({ ...prev, user: userData }));
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      await AsyncStorage.setItem('token', response.token);
      setState(prev => ({ 
        ...prev, 
        token: response.token,
        user: response.user,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Invalid credentials' 
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiRegister(name, email, password);
      await AsyncStorage.setItem('token', response.token);
      setState(prev => ({ 
        ...prev, 
        token: response.token,
        user: response.user,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Registration failed' 
      }));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 