import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const chatCacheMap = new Map<string | number, ChatMessage[]>();

export interface ChatCitation {
  filePath: string;
  chunkType?: string;
  startLine?: number;
  endLine?: number;
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: ChatCitation[];
  stats?: {
    chunksUsed?: number;
    approxTokens?: number;
    latencyMs?: number;
  };
  createdAt: Date;
}

export function useRepositoryChat(repositoryId: number | string | null) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (repositoryId && chatCacheMap.has(repositoryId)) {
      return chatCacheMap.get(repositoryId)!;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return token || localStorage.getItem('nexora_token');
  }, [token]);

  const sendMessage = async (question: string): Promise<boolean> => {
    const trimmed = question.trim();
    if (!trimmed || !repositoryId || isLoading) return false;

    const currentToken = getAuthToken();
    if (!currentToken) {
      setError('Please log in to chat with the AI assistant.');
      return false;
    }

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmed,
      createdAt: new Date()
    };

    // Append user message immediately
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    if (repositoryId) chatCacheMap.set(repositoryId, updatedWithUser);
    setIsLoading(true);
    setError(null);

    // Format previous history for context continuity
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload
        })
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        throw new Error(resData.message || `Request failed (HTTP ${res.status})`);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: resData.answer || 'No answer generated.',
        citations: Array.isArray(resData.citations) ? resData.citations : [],
        stats: resData.stats,
        createdAt: new Date()
      };

      setMessages((prev) => {
        const next = [...prev, assistantMsg];
        if (repositoryId) chatCacheMap.set(repositoryId, next);
        return next;
      });
      return true;
    } catch (err: any) {
      console.error('AI chat error:', err);
      setError(err.message || 'Failed to get an answer from NEXORA AI.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = useCallback(() => {
    if (repositoryId) chatCacheMap.delete(repositoryId);
    setMessages([]);
    setError(null);
  }, [repositoryId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory
  };
}
