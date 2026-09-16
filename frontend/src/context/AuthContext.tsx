import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: number | string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type AuthActionType = 'google' | 'github' | 'login' | 'register' | 'verifying' | null;

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authAction: AuthActionType;
  authStatusMessage: string | null;
  currentPage: 'home' | 'signin' | 'signup' | 'dashboard';
  navigateTo: (page: 'home' | 'signin' | 'signup' | 'dashboard') => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (payload: { credential?: string; accessToken?: string }) => Promise<{ success: boolean; message?: string }>;
  triggerGoogleSignIn: () => void;
  loginWithGithub: (payload: { code?: string; accessToken?: string }) => Promise<{ success: boolean; message?: string }>;
  triggerGithubSignIn: () => void;
  logout: () => void;
}

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '247080342250-gknlddsc3icjiticu6uqjq31fjq21fq8.apps.googleusercontent.com';

export const GITHUB_CLIENT_ID =
  import.meta.env.VITE_GITHUB_CLIENT_ID ||
  'Ov23liM5dNvXngFXio8t';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nexora_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authAction, setAuthAction] = useState<AuthActionType>('verifying');
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>('Authenticating in progress...');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const getInitialPage = (): 'home' | 'signin' | 'signup' | 'dashboard' => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (
      path === '/dashboard' || 
      hash === '#dashboard' || 
      hash === '#/dashboard' || 
      path.startsWith('/repositories') || 
      hash.startsWith('#/repositories') ||
      hash.startsWith('#repositories')
    ) {
      return 'dashboard';
    }
    if (path === '/signin' || hash === '#signin' || hash === '#/signin') return 'signin';
    if (path === '/signup' || hash === '#signup' || hash === '#/signup') return 'signup';
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<'home' | 'signin' | 'signup' | 'dashboard'>(getInitialPage);

  const navigateTo = useCallback((page: 'home' | 'signin' | 'signup' | 'dashboard') => {
    setCurrentPage(page);
    const targetUrl = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
    }
    window.scrollTo(0, 0);
  }, []);

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

  // Verify token on mount or process incoming OAuth token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const code = params.get('code');

    if (tokenFromUrl) {
      setIsLoading(true);
      setAuthAction('verifying');
      setAuthStatusMessage('Authenticating in progress...');
      localStorage.setItem('nexora_token', tokenFromUrl);
      setToken(tokenFromUrl);
      const cleanUrl = window.location.pathname === '/dashboard' ? '/dashboard' : '/dashboard';
      window.history.replaceState({}, document.title, cleanUrl);
      setCurrentPage('dashboard');

      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenFromUrl}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(console.error)
        .finally(() => {
          setIsLoading(false);
          setAuthAction(null);
          setAuthStatusMessage(null);
        });
      return;
    }

    if (code) {
      setIsLoading(true);
      setAuthAction('github');
      setAuthStatusMessage('Authenticating in progress...');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      loginWithGithub({ code });
      return;
    }

    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('nexora_token');
      if (!storedToken) {
        setIsLoading(false);
        setAuthAction(null);
        setAuthStatusMessage(null);
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
        setAuthAction(null);
        setAuthStatusMessage(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthAction('login');
    setAuthStatusMessage('Authenticating in progress...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        setAuthAction(null);
        setAuthStatusMessage(null);
        return { success: false, message: data.message || 'Login failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      return { success: false, message: err.message || 'Network error connecting to auth server' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setAuthAction('register');
    setAuthStatusMessage('Authenticating in progress...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        setAuthAction(null);
        setAuthStatusMessage(null);
        return { success: false, message: data.message || 'Registration failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      return { success: false, message: err.message || 'Network error connecting to auth server' };
    }
  };

  const loginWithGoogle = async (payload: { credential?: string; accessToken?: string }) => {
    setIsLoading(true);
    setAuthAction('google');
    setAuthStatusMessage('Authenticating in progress...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        setAuthAction(null);
        setAuthStatusMessage(null);
        return { success: false, message: data.message || 'Google authentication failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      return { success: false, message: err.message || 'Network error connecting to Google auth server' };
    }
  };

  const triggerGoogleSignIn = () => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    setAuthAction('google');
    setAuthStatusMessage('Authenticating in progress...');

    const googleObj = (window as any).google;

    // First preference: OAuth2 token client popup
    if (googleObj?.accounts?.oauth2) {
      try {
        const tokenClient = googleObj.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              console.error('Google OAuth token error:', tokenResponse);
              setIsLoading(false);
              setAuthAction(null);
              setAuthStatusMessage(null);
              return;
            }
            if (tokenResponse?.access_token) {
              await loginWithGoogle({ accessToken: tokenResponse.access_token });
            } else {
              setIsLoading(false);
              setAuthAction(null);
              setAuthStatusMessage(null);
            }
          },
          error_callback: (err: any) => {
            console.error('Google OAuth error:', err);
            setIsLoading(false);
            setAuthAction(null);
            setAuthStatusMessage(null);
          },
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn('OAuth2 client init failed, falling back to OneTap ID client:', e);
      }
    }

    // Second preference: Google Identity Services ID token prompt
    if (googleObj?.accounts?.id) {
      try {
        googleObj.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response?.credential) {
              await loginWithGoogle({ credential: response.credential });
            } else {
              setIsLoading(false);
              setAuthAction(null);
              setAuthStatusMessage(null);
            }
          },
        });
        googleObj.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            // If prompt was skipped or not displayed, fallback cleanly
          }
        });
        return;
      } catch (e) {
        console.warn('Google accounts.id init failed:', e);
      }
    }

    // Fallback: Redirect to server-side Google OAuth endpoint
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:5000/api/auth/google/callback')}&response_type=code&scope=openid%20email%20profile`;
  };

  const loginWithGithub = async (payload: { code?: string; accessToken?: string }) => {
    setIsLoading(true);
    setAuthAction('github');
    setAuthStatusMessage('Authenticating in progress...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        setAuthAction(null);
        setAuthStatusMessage(null);
        return { success: false, message: data.message || 'GitHub authentication failed' };
      }

      localStorage.setItem('nexora_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      closeAuthModal();
      navigateTo('dashboard');
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      setAuthAction(null);
      setAuthStatusMessage(null);
      return { success: false, message: err.message || 'Network error connecting to GitHub auth server' };
    }
  };

  const triggerGithubSignIn = () => {
    if (typeof window === 'undefined') return;
    setIsLoading(true);
    setAuthAction('github');
    setAuthStatusMessage('Authenticating in progress...');
    const redirectUri = 'http://localhost:5000/api/auth/github/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = githubAuthUrl;
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    setToken(null);
    setUser(null);
    setAuthAction(null);
    setAuthStatusMessage(null);
    navigateTo('home');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        authAction,
        authStatusMessage,
        currentPage,
        navigateTo,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        triggerGoogleSignIn,
        loginWithGithub,
        triggerGithubSignIn,
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
