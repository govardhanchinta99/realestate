import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getApiUrl } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  role?: 'admin' | 'buyer' | 'agent';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginAsDemo: (role: 'admin' | 'buyer') => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email identification (supports custom admin emails or demo admin)
const ADMIN_EMAILS = ['govardhanchinta999@gmail.com', 'admin@realestatemate.ai', 'admin@demo.com'];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('realestate_auth_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    }
    return null;
  });

  const checkIsAdmin = (email: string): boolean => {
    const clean = email.toLowerCase().trim();
    return ADMIN_EMAILS.some((adm) => adm.toLowerCase().trim() === clean) || clean.includes('admin');
  };

  const login = async (email: string, password: string) => {
    const isAdmin = checkIsAdmin(email);

    try {
      const response = await axios.post(
        getApiUrl('/api/auth/login'),
        { email, password },
        { timeout: 4000 }
      );
      const userData = response.data.user;
      const userWithAdmin: User = {
        id: userData.id || userData._id,
        name: userData.name || email.split('@')[0],
        email: userData.email || email,
        avatar: userData.avatar,
        isAdmin: isAdmin || !!userData.isAdmin,
        role: isAdmin ? 'admin' : 'buyer'
      };
      setUser(userWithAdmin);
      localStorage.setItem('realestate_auth_user', JSON.stringify(userWithAdmin));
    } catch (error) {
      // If server is not responding, allow password check or demo fallback
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      // Offline / Demo fallback
      console.log('Logging in with local credentials (offline/demo mode)');
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email: email,
        isAdmin,
        role: isAdmin ? 'admin' : 'buyer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
      };
      setUser(fallbackUser);
      localStorage.setItem('realestate_auth_user', JSON.stringify(fallbackUser));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const isAdmin = checkIsAdmin(email);

    try {
      const response = await axios.post(
        getApiUrl('/api/auth/signup'),
        { name, email, password },
        { timeout: 4000 }
      );
      const userData = response.data.user;
      const userWithAdmin: User = {
        id: userData.id || userData._id,
        name: userData.name || name,
        email: userData.email || email,
        isAdmin: isAdmin || !!userData.isAdmin,
        role: isAdmin ? 'admin' : 'buyer'
      };
      setUser(userWithAdmin);
      localStorage.setItem('realestate_auth_user', JSON.stringify(userWithAdmin));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error('An account with this email already exists');
      }

      // Offline fallback
      console.log('Creating account in local session (offline/demo mode)');
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        isAdmin,
        role: isAdmin ? 'admin' : 'buyer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
      };
      setUser(fallbackUser);
      localStorage.setItem('realestate_auth_user', JSON.stringify(fallbackUser));
    }
  };

  const loginAsDemo = (role: 'admin' | 'buyer') => {
    const isAdm = role === 'admin';
    const demoUser: User = {
      id: isAdm ? 'demo_admin_1' : 'demo_buyer_1',
      name: isAdm ? 'Govardhan Chinta' : 'Alex Mercer',
      email: isAdm ? 'admin@realestatemate.ai' : 'alex.mercer@gmail.com',
      isAdmin: isAdm,
      role: isAdm ? 'admin' : 'buyer',
      avatar: isAdm
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'
    };
    setUser(demoUser);
    localStorage.setItem('realestate_auth_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('realestate_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginAsDemo,
        logout,
        isAuthenticated: !!user,
        isAdmin: !!(user?.isAdmin || (user?.email && checkIsAdmin(user.email))),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
