import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GitHubRepoItem {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
  updatedAt: string;
}

export interface SavedRepository {
  id: number;
  userId: number;
  githubRepositoryId: string;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
  githubUpdatedAt: string;
  commitSha?: string | null;
  fileCount?: number;
  sourceFileCount?: number;
  ignoredFileCount?: number;
  totalSourceSizeBytes?: number;
  ingestedAt?: string | null;
  latestJobId?: number | null;
  latestJobStatus?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null;
  latestJobStage?: string | null;
  isAnalyzed?: boolean;
  createdAt: string;
  updatedAt: string;
}

let cachedSavedRepos: SavedRepository[] | null = null;

export function useRepositories(isGitHubConnected = false) {
  const { token } = useAuth();
  
  // GitHub Repositories (for selection)
  const [gitHubRepos, setGitHubRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  
  // Saved Repositories (in PostgreSQL) - instant load from cache
  const [savedRepositories, setSavedRepositories] = useState<SavedRepository[]>(() => cachedSavedRepos || []);
  const [activeSavedRepo, setActiveSavedRepo] = useState<SavedRepository | null>(null);

  // Status flags
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(() => cachedSavedRepos === null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  // Debounce search reference
  const searchTimeoutRef = useRef<any>(null);

  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem('nexora_token');
  }, [token]);

  // Fetch saved repositories from NEXORA backend
  const fetchSavedRepositories = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setIsLoadingSaved(false);
      return;
    }

    try {
      if (!cachedSavedRepos) {
        setIsLoadingSaved(true);
      }
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch saved repositories');
      const data = await res.json();
      if (data.success) {
        cachedSavedRepos = data.repositories || [];
        setSavedRepositories(data.repositories || []);
        // If there's an active saved repo, keep it updated
        if (activeSavedRepo) {
          const updated = data.repositories.find((r: SavedRepository) => r.id === activeSavedRepo.id);
          if (updated) setActiveSavedRepo(updated);
        }
      }
    } catch (err: any) {
      console.error('Error fetching saved repositories:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, [getAuthToken, activeSavedRepo]);

  // Fetch repositories from GitHub API via NEXORA backend
  const fetchGitHubRepos = useCallback(async (query = searchQuery, pageNum = page) => {
    const currentToken = getAuthToken();
    if (!currentToken || !isGitHubConnected) {
      setGitHubRepos([]);
      setIsLoadingGitHub(false);
      return;
    }

    setIsLoadingGitHub(true);
    setError(null);
    setNeedsReauth(false);

    try {
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : '';
      const url = `${API_BASE_URL}/api/github/repositories?page=${pageNum}&per_page=${perPage}${searchParam}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          Accept: 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to load repositories (HTTP ${res.status})`);
      }

      const data = await res.json();

      if (data.rate_limited) {
        setError(data.message || 'GitHub rate limit temporarily reached. Please wait a moment.');
        return;
      }

      if (data.needs_reauth) {
        setNeedsReauth(true);
        setError('GitHub authorization expired. Please reconnect your account.');
        setGitHubRepos([]);
        return;
      }

      if (data.success) {
        setGitHubRepos(data.repositories || []);
        setHasMore(Boolean(data.hasMore));
        setTotalCount(data.totalCount);
        setPage(data.page || pageNum);
      } else {
        setError(data.message || 'Could not load repositories from GitHub');
      }
    } catch (err: any) {
      console.error('Fetch GitHub repos error:', err);
      setError(err.message || 'An unexpected error occurred while fetching repositories');
    } finally {
      setIsLoadingGitHub(false);
    }
  }, [getAuthToken, isGitHubConnected, perPage, searchQuery, page]);

  // Handle Search Input Change with Debounce
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchGitHubRepos(val, 1);
    }, 350);
  };

  // Pagination Handlers
  const handleNextPage = () => {
    if (!hasMore || isLoadingGitHub) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGitHubRepos(searchQuery, nextPage);
  };

  const handlePrevPage = () => {
    if (page <= 1 || isLoadingGitHub) return;
    const prevPage = page - 1;
    setPage(prevPage);
    fetchGitHubRepos(searchQuery, prevPage);
  };

  // Save selected repository to NEXORA
  const saveSelectedRepository = async (): Promise<SavedRepository | null> => {
    if (!selectedRepo) return null;

    const currentToken = getAuthToken();
    if (!currentToken) {
      setError('You must be logged in to save a repository');
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          githubRepositoryId: selectedRepo.id
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save repository');
      }

      const saved: SavedRepository = data.repository;
      setActiveSavedRepo(saved);
      await fetchSavedRepositories();
      return saved;
    } catch (err: any) {
      console.error('Error saving repository:', err);
      setError(err.message || 'Failed to save repository');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSavedRepositories();
  }, [fetchSavedRepositories]);

  useEffect(() => {
    if (isGitHubConnected) {
      fetchGitHubRepos(searchQuery, 1);
    } else {
      setGitHubRepos([]);
    }
  }, [isGitHubConnected]);

  return {
    gitHubRepos,
    savedRepositories,
    selectedRepo,
    activeSavedRepo,
    searchQuery,
    page,
    perPage,
    hasMore,
    totalCount,
    isLoadingGitHub,
    isLoadingSaved,
    isSaving,
    error,
    needsReauth,
    setSelectedRepo,
    setActiveSavedRepo,
    handleSearchChange,
    handleNextPage,
    handlePrevPage,
    saveSelectedRepository,
    refetchGitHub: () => fetchGitHubRepos(searchQuery, page),
    refetchSaved: fetchSavedRepositories
  };
}
