import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GitHubStatus {
  connected: boolean;
  githubUsername: string | null;
  scopes?: string | null;
  connectedAt?: string | null;
}

export function useGitHub() {
  const { token, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<GitHubStatus>({
    connected: false,
    githubUsername: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    const currentToken = token || localStorage.getItem('nexora_token');
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/github/status`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setStatus({ connected: false, githubUsername: null });
        }
        return;
      }

      const data = await res.json();
      if (data.success) {
        setStatus({
          connected: !!data.connected,
          githubUsername: data.githubUsername || null,
          scopes: data.scopes || null,
          connectedAt: data.connectedAt || null
        });
      }
    } catch (err) {
      console.error('Failed to fetch GitHub connection status:', err);
    } finally {
      setIsLoading(false);
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
      setNotification({
        type: 'success',
        message: username 
          ? `Successfully connected GitHub account @${username}!` 
          : 'Successfully connected GitHub account!'
      });
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStatus();
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
      fetchStatus();
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
