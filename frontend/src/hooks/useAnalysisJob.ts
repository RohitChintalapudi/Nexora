import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type AnalysisStage = 
  | 'QUEUED' 
  | 'INITIALIZING' 
  | 'FETCHING_REPOSITORY' 
  | 'SCANNING_FILES' 
  | 'FILTERING_FILES' 
  | 'PERSISTING_FILES' 
  | 'COMPLETED' 
  | 'FAILED';

export interface AnalysisJob {
  id: number;
  repositoryId: number;
  repositoryName?: string;
  repositoryFullName?: string;
  status: JobStatus;
  currentStage: AnalysisStage;
  errorMessage?: string | null;
  filesScanned?: number;
  filesIncluded?: number;
  filesIgnored?: number;
  totalSizeBytes?: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export function useAnalysisJob() {
  const { token } = useAuth();
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem('nexora_token');
  }, [token]);

  // Fetch job status by ID
  const fetchJobStatus = useCallback(async (jobId: number): Promise<AnalysisJob | null> => {
    const currentToken = getAuthToken();
    if (!currentToken || !jobId) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/analysis/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch job status (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (data.success && data.job) {
        const updatedJob: AnalysisJob = data.job;
        setJob(updatedJob);
        return updatedJob;
      }
      return null;
    } catch (err: any) {
      console.error('Error polling job status:', err);
      return null;
    }
  }, [getAuthToken]);

  // Fetch latest job for a repository
  const fetchLatestJob = useCallback(async (repositoryId: number): Promise<AnalysisJob | null> => {
    const currentToken = getAuthToken();
    if (!currentToken || !repositoryId) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analysis/latest`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.success && data.job) {
        setJob(data.job);
        return data.job;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching latest repository job:', err);
      return null;
    }
  }, [getAuthToken]);

  // Start analysis for a repository
  const startAnalysis = async (repositoryId: number): Promise<AnalysisJob | null> => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setError('Authentication required to start analysis.');
      return null;
    }

    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to initiate repository analysis');
      }

      const initialJob: AnalysisJob = {
        id: data.jobId,
        repositoryId,
        status: data.status || 'QUEUED',
        currentStage: data.currentStage || 'QUEUED',
        createdAt: new Date().toISOString()
      };

      setJob(initialJob);
      return initialJob;
    } catch (err: any) {
      console.error('Start analysis error:', err);
      setError(err.message || 'Could not start repository analysis');
      return null;
    } finally {
      setIsStarting(false);
    }
  };

  // Automated polling effect
  useEffect(() => {
    if (!job || !job.id) return;

    const isTerminal = job.status === 'COMPLETED' || job.status === 'FAILED';

    if (isTerminal) {
      setIsPolling(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    setIsPolling(true);

    // Set up 2-second polling interval
    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(async () => {
        const latest = await fetchJobStatus(job.id);
        if (latest && (latest.status === 'COMPLETED' || latest.status === 'FAILED')) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsPolling(false);
        }
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [job?.id, job?.status, fetchJobStatus]);

  const resetJob = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setJob(null);
    setError(null);
    setIsPolling(false);
  };

  return {
    job,
    isStarting,
    isPolling,
    error,
    startAnalysis,
    fetchJobStatus,
    fetchLatestJob,
    resetJob,
    setJob
  };
}
