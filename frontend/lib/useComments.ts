import { useState, useEffect, useCallback } from 'react';

export interface CommentUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Comment {
  id: number;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  eventId: number;
  parentId: number | null;
  isOwner?: boolean;
  isHidden?: boolean;
  user: CommentUser;
  replies?: Comment[];
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  totalComments: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  createComment: (eventId: number, content: string, parentId?: number | null) => Promise<boolean>;
  editComment: (commentId: number, content: string) => Promise<boolean>;
  deleteComment: (commentId: number) => Promise<boolean>;
  hideComment: (commentId: number, status: string) => Promise<boolean>;
}

const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = hostname === 'eventoscordoba.xyz';
  if (isLocalhost) return 'http://localhost:3001';
  if (isProduction) return process.env.NEXT_PUBLIC_API_URL || 'https://eventoscordoba.xyz';
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'https://eventoscordoba.xyz';
};

export function useComments(eventId: number | undefined, token: string | null): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);

  const fetchComments = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!eventId) return;
    try {
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${apiUrl}/api/comments/events/${eventId}/comments?page=${pageNum}&limit=10`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setComments(prev => [...prev, ...data.data]);
        } else {
          setComments(data.data);
        }
        setTotalComments(data.stats?.totalComments ?? 0);
        setTotalPages(data.pagination?.pages ?? 0);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Error al cargar comentarios');
      }
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
      console.error('Fetch comments error:', err);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (!eventId) return;
    setPage(1);
    setComments([]);
    setTotalComments(0);
    setTotalPages(0);
    setInitialLoading(true);
    fetchComments(1, false).finally(() => setInitialLoading(false));
  }, [eventId, fetchComments]);

  const loadMore = async () => {
    const nextPage = page + 1;
    if (nextPage > totalPages) return;
    setPage(nextPage);
    setLoading(true);
    await fetchComments(nextPage, true);
    setLoading(false);
  };

  const createComment = async (eId: number, content: string, parentId?: number | null): Promise<boolean> => {
    if (!token) return false;
    const tempId = -Date.now();
    const optimisticComment: Comment = {
      id: tempId,
      content,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 0,
      eventId: eId,
      parentId: parentId ?? null,
      isOwner: true,
      user: { id: 0, name: '...', avatar: null },
      replies: [],
    };

    if (parentId) {
      setComments(prev => prev.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), optimisticComment] };
        }
        return c;
      }));
    } else {
      setComments(prev => [optimisticComment, ...prev]);
      setTotalComments(prev => prev + 1);
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: eId, content, parentId: parentId ?? null }),
      });

      if (response.ok) {
        const data = await response.json();
        const newComment = data.data;
        if (parentId) {
          setComments(prev => prev.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: c.replies?.map(r => r.id === tempId ? { ...newComment, replies: [] } : r) ?? [],
              };
            }
            return c;
          }));
        } else {
          setComments(prev => prev.map(c => c.id === tempId ? { ...newComment, replies: [] } : c));
        }
        setTotalComments(prev => parentId ? prev : prev);
        return true;
      } else {
        throw new Error('Error al crear comentario');
      }
    } catch (err) {
      if (parentId) {
        setComments(prev => prev.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: c.replies?.filter(r => r.id !== tempId) ?? [] };
          }
          return c;
        }));
      } else {
        setComments(prev => prev.filter(c => c.id !== tempId));
        setTotalComments(prev => Math.max(0, prev - 1));
      }
      setError('Error al crear comentario');
      console.error('Create comment error:', err);
      return false;
    }
  };

  const editComment = async (commentId: number, content: string): Promise<boolean> => {
    if (!token) return false;

    const updateInList = (commentsList: Comment[]): Comment[] =>
      commentsList.map(c => {
        if (c.id === commentId) return { ...c, content };
        if (c.replies) return { ...c, replies: updateInList(c.replies) };
        return c;
      });

    setComments(prev => updateInList(prev));

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        return true;
      } else {
        const errData = await response.json();
        setError(errData.error || 'Error al editar comentario');
        await fetchComments(1, false);
        return false;
      }
    } catch (err) {
      setError('Error al editar comentario');
      await fetchComments(1, false);
      return false;
    }
  };

  const deleteComment = async (commentId: number): Promise<boolean> => {
    if (!token) return false;

    const markDeleted = (commentsList: Comment[]): Comment[] =>
      commentsList.map(c => {
        if (c.id === commentId) return { ...c, content: '[comentario eliminado]', status: 'hidden' };
        if (c.replies) return { ...c, replies: markDeleted(c.replies) };
        return c;
      });

    setComments(prev => markDeleted(prev));

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Error al eliminar comentario');
      }
    } catch (err) {
      setError('Error al eliminar comentario');
      await fetchComments(1, false);
      return false;
    }
  };

  const hideComment = async (commentId: number, status: string): Promise<boolean> => {
    if (!token) return false;

    const updateStatus = (commentsList: Comment[]): Comment[] =>
      commentsList.map(c => {
        if (c.id === commentId) return { ...c, status, isHidden: status === 'hidden' };
        if (c.replies) return { ...c, replies: updateStatus(c.replies) };
        return c;
      });

    setComments(prev => updateStatus(prev));

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/comments/${commentId}/hide`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Error al moderar comentario');
      }
    } catch (err) {
      setError('Error al moderar comentario');
      await fetchComments(1, false);
      return false;
    }
  };

  return {
    comments,
    loading: initialLoading || loading,
    error,
    totalComments,
    hasMore: page < totalPages,
    loadMore,
    createComment,
    editComment,
    deleteComment,
    hideComment,
  };
}
