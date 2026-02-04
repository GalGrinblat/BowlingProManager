import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, playersApi } from '../services/api';
import type { AuthContextType } from '../types/index';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [playerData, setPlayerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const user = authApi.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'player') {
        const player = playersApi.getById(user.userId);
        setPlayerData(player);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string, role: 'admin' | 'player' = 'player') => {
    const user = authApi.login(userId, role);
    setCurrentUser(user);
    
    if (role === 'player') {
      const player = playersApi.getById(userId);
      setPlayerData(player);
    }
    
    return user;
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    setPlayerData(null);
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const isPlayer = () => {
    return currentUser && currentUser.role === 'player';
  };

  const value = {
    currentUser,
    playerData,
    isLoading,
    login,
    logout,
    isAdmin,
    isPlayer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
