import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AnalysisResponse, SourceFilePreview } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useRepositoryAnalysis(repositoryId: number | string | null) {
  const { token } = useAuth();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem('nexora_token');
  }, [token]);

  const fetchAnalysis = useCallback(async (isSilent = false) => {
    const currentToken = getAuthToken();
    if (!currentToken || !repositoryId) {
      setIsLoading(false);
      return null;
    }

    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analysis`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          throw new Error('Repository not found or access denied');
        }
        throw new Error(`Failed to load analysis (HTTP ${res.status})`);
      }

      const json: AnalysisResponse = await res.json();
      if (json.success) {
        setData(json);
        setError(null);
        return json;
      } else {
        throw new Error(json.message || 'Failed to retrieve analysis');
      }
    } catch (err: any) {
      console.error('Error fetching repository analysis:', err);
      setError(err.message || 'Could not load repository analysis');
      return null;
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  }, [repositoryId, getAuthToken]);

  // Initial fetch on mount or repositoryId change
  useEffect(() => {
    if (repositoryId) {
      fetchAnalysis();
    } else {
      setData(null);
      setIsLoading(false);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [repositoryId, fetchAnalysis]);

  // Auto-polling when analysis is IN_PROGRESS
  useEffect(() => {
    if (!data || data.status !== 'IN_PROGRESS') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(async () => {
        const latest = await fetchAnalysis(true);
        if (latest && (latest.status === 'COMPLETED' || latest.status === 'FAILED')) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }, 2500);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [data?.status, fetchAnalysis]);

  // Trigger re-analysis using existing M4 endpoint
  const reanalyze = async (): Promise<{ success: boolean; message?: string }> => {
    const currentToken = getAuthToken();
    if (!currentToken || !repositoryId) {
      return { success: false, message: 'Authentication required' };
    }

    setIsReanalyzing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to trigger re-analysis');
      }

      // Refresh analysis state to IN_PROGRESS
      await fetchAnalysis(true);
      return { success: true, message: resData.message };
    } catch (err: any) {
      console.error('Re-analyze error:', err);
      return { success: false, message: err.message || 'Failed to trigger re-analysis' };
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Fetch single file content for source reference inspector
  const fetchFileContent = async (filePath: string): Promise<SourceFilePreview | null> => {
    const currentToken = getAuthToken();
    if (!currentToken || !repositoryId || !filePath) return null;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/repositories/${repositoryId}/file-content?path=${encodeURIComponent(filePath)}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            Accept: 'application/json'
          }
        }
      );

      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.file) {
        return json.file;
      }
      return null;
    } catch (err) {
      console.error('Error fetching file content:', err);
      return null;
    }
  };

  return {
    data,
    isLoading,
    isReanalyzing,
    error,
    refetch: fetchAnalysis,
    reanalyze,
    fetchFileContent
  };
}
