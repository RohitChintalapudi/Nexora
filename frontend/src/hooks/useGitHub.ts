import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GitHubStatus {
  connected: boolean;
  githubUsername: string | null;
  scopes?: string | null;
  connectedAt?: string | null;
}

const getCachedGitHubStatus = (): GitHubStatus => {
  try {
    const raw = localStorage.getItem('nexora_github_status');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.connected === 'boolean') {
        return {
          connected: parsed.connected,
          githubUsername: parsed.githubUsername || null,
          scopes: parsed.scopes || null,
          connectedAt: parsed.connectedAt || null
        };
      }
    }
  } catch {
    // Ignore JSON parse error
  }
  return {
    connected: false,
    githubUsername: null
  };
};

export function useGitHub() {
  const { token, user, isAuthenticated } = useAuth();
  
  // Instant synchronous initialization from cached status
  const [status, setStatus] = useState<GitHubStatus>(() => {
    if (user?.githubConnected !== undefined) {
      return {
        connected: !!user.githubConnected,
        githubUsername: user.githubUsername || null
      };
    }
    return getCachedGitHubStatus();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize when auth user object updates
  useEffect(() => {
    if (user?.githubConnected !== undefined) {
      setStatus(prev => ({
        ...prev,
        connected: !!user.githubConnected,
        githubUsername: user.githubUsername || null
      }));
    }
  }, [user]);

  // Listen to cross-component and storage change events
  useEffect(() => {
    const handleStatusChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ connected: boolean; githubUsername: string | null }>;
      if (customEvent.detail) {
        setStatus(prev => ({
          ...prev,
          connected: customEvent.detail.connected,
          githubUsername: customEvent.detail.githubUsername
        }));
      } else {
        setStatus(getCachedGitHubStatus());
      }
    };

    window.addEventListener('nexora:github-status-changed', handleStatusChanged);
    window.addEventListener('storage', handleStatusChanged);

    return () => {
      window.removeEventListener('nexora:github-status-changed', handleStatusChanged);
      window.removeEventListener('storage', handleStatusChanged);
    };
  }, []);

  const fetchStatus = useCallback(async (silent = false) => {
    const currentToken = token || localStorage.getItem('nexora_token');
    if (!currentToken) {
      setStatus({ connected: false, githubUsername: null });
      localStorage.removeItem('nexora_github_status');
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`${API_BASE_URL}/api/github/status`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        },
        signal: controller.signal
      });

      if (!res.ok) {
        if (res.status === 401) {
          setStatus({ connected: false, githubUsername: null });
          localStorage.removeItem('nexora_github_status');
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        const updatedStatus: GitHubStatus = {
          connected: !!data.connected,
          githubUsername: data.githubUsername || null,
          scopes: data.scopes || null,
          connectedAt: data.connectedAt || null
        };
        setStatus(updatedStatus);

        if (updatedStatus.connected) {
          localStorage.setItem('nexora_github_status', JSON.stringify(updatedStatus));
        } else {
          localStorage.removeItem('nexora_github_status');
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch GitHub connection status:', err);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [token]);

  // Check URL params on redirect from GitHub OAuth callback
  useEffect(() => {
    if (!isAuthenticated) return;

    const params = new URLSearchParams(window.location.search);
    const githubConnected = params.get('github_connected');
    const githubError = params.get('github_error');
    const username = params.get('github_username');

    if (githubConnected === 'true') {
      const updatedStatus: GitHubStatus = {
        connected: true,
        githubUsername: username || null
      };
      setStatus(updatedStatus);
      localStorage.setItem('nexora_github_status', JSON.stringify(updatedStatus));

      setNotification({
        type: 'success',
        message: username 
          ? `Successfully connected GitHub account @${username}!` 
          : 'Successfully connected GitHub account!'
      });
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStatus(true);
    } else if (githubError) {
      const decoded = decodeURIComponent(githubError);
      const displayMsg = decoded.toLowerCase().includes('terminated')
        ? 'Connection was interrupted during authorization. Please click Connect GitHub to try again.'
        : decoded.startsWith('GitHub authorization:')
          ? decoded
          : `GitHub authorization: ${decoded}`;
      setNotification({
        type: 'error',
        message: displayMsg
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      fetchStatus(true);
    }
  }, [isAuthenticated, fetchStatus]);

  const connectGitHub = async () => {
    const currentToken = token || localStorage.getItem('nexora_token');
    if (!currentToken) {
      setNotification({ type: 'error', message: 'You must be logged in to connect GitHub' });
      return;
    }

    setIsConnecting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/github/connect?format=json`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: 'application/json'
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || 'Failed to initiate GitHub authorization');
      }

      // Redirect user to GitHub OAuth authorization URL
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Connect GitHub error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Could not connect to GitHub authorization service'
      });
      setIsConnecting(false);
    }
  };

  const disconnectGitHub = async (): Promise<boolean> => {
    const currentToken = token || localStorage.getItem('nexora_token');
    if (!currentToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/api/github/disconnect`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ connected: false, githubUsername: null });
        localStorage.removeItem('nexora_github_status');
        window.dispatchEvent(new CustomEvent('nexora:github-status-changed', {
          detail: { connected: false, githubUsername: null }
        }));
        setNotification({
          type: 'success',
          message: 'GitHub account disconnected successfully'
        });
        return true;
      }
      throw new Error(data.message || 'Failed to disconnect GitHub');
    } catch (err: any) {
      console.error('Disconnect GitHub error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to disconnect GitHub account'
      });
      return false;
    }
  };

  const dismissNotification = () => setNotification(null);

  return {
    ...status,
    isLoading,
    isConnecting,
    notification,
    connectGitHub,
    disconnectGitHub,
    dismissNotification,
    refetch: fetchStatus
  };
}
