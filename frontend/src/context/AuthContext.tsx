import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number | string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentPage: 'home' | 'signin' | 'signup' | 'dashboard';
  navigateTo: (page: 'home' | 'signin' | 'signup' | 'dashboard') => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const getInitialPage = (): 'home' | 'signin' | 'signup' | 'dashboard' => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/dashboard' || hash === '#dashboard' || hash === '#/dashboard') return 'dashboard';
    if (path === '/signin' || hash === '#signin' || hash === '#/signin') return 'signin';
    if (path === '/signup' || hash === '#signup' || hash === '#/signup') return 'signup';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<'home' | 'signin' | 'signup' | 'dashboard'>(getInitialPage);

  const navigateTo = (page: 'home' | 'signin' | 'signup' | 'dashboard') => {
    setCurrentPage(page);
    const targetUrl = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Verify token on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('nexora_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('nexora_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, message: data.message || 'Login failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error connecting to auth server' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, message: data.message || 'Registration failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Network error connecting to auth server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    setToken(null);
    setUser(null);
    navigateTo('home');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        currentPage,
        navigateTo,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
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
