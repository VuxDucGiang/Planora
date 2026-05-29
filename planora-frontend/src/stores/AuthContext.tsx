import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';
import { parseToken } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedToken = localStorage.getItem('planora_token');
    if (storedToken) {
      const parsedUser = parseToken(storedToken);
      if (parsedUser) {
        setToken(storedToken);
        setUser(parsedUser);
      } else {
        localStorage.removeItem('planora_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken: string) => {
    localStorage.setItem('planora_token', jwtToken);
    const parsedUser = parseToken(jwtToken);
    setToken(jwtToken);
    setUser(parsedUser);
  };

  const logout = () => {
    localStorage.removeItem('planora_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
