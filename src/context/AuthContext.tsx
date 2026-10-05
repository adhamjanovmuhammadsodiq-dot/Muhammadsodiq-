import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { ApiClient } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'student' | 'teacher';
  openAuthModal: (tab?: 'student' | 'teacher') => void;
  closeAuthModal: () => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => ApiClient.getCachedUser());
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'student' | 'teacher'>('student');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('testpro_theme') : null;
    if (saved) return saved === 'dark';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('testpro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('testpro_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    async function initAuth() {
      const token = ApiClient.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await ApiClient.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Sessiya topilmadi yoki eskirgan:', err);
        ApiClient.clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const openAuthModal = (tab: 'student' | 'teacher' = 'student') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await ApiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        setUser,
        logout,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
