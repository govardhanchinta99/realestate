import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin email configuration
const ADMIN_EMAIL = 'govardhanchinta999@gmail.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    const userData = response.data.user;

    // Check if user email matches admin email
    const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

    const userWithAdmin = { ...userData, isAdmin };
    setUser(userWithAdmin);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { name, email, password });
    const userData = response.data.user;

    // Check if user email matches admin email
    const isAdmin = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

    const userWithAdmin = { ...userData, isAdmin };
    setUser(userWithAdmin);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
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
