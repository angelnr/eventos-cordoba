import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useComments } from '../lib/useComments';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Button } from './ui/Button';
import Link from 'next/link';

interface CommentSectionProps {
  eventId: number;
  isOrganizerOrAdmin?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  eventId,
  isOrganizerOrAdmin = false,
}) => {
  const { user, token } = useAuth();
  const {
    comments,
    loading,
    error,
    totalComments,
    hasMore,
    loadMore,
    createComment,
    editComment,
    deleteComment,
    hideComment,
  } = useComments(eventId, token);

  const [replyFormOpenId, setReplyFormOpenId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateComment = async (content: string): Promise<boolean> => {
    setIsSubmitting(true);
    const success = await createComment(eventId, content);
    setIsSubmitting(false);
    return success;
  };

  const handleReply = (parentId: number) => {
    setReplyFormOpenId(replyFormOpenId === parentId ? null : parentId);
  };

  const handleReplySubmit = async (parentId: number, content: string): Promise<boolean> => {
    setIsSubmitting(true);
    const success = await createComment(eventId, content, parentId);
    setIsSubmitting(false);
    if (success) {
      setReplyFormOpenId(null);
    }
    return success;
  };

  const handleCancelReply = () => {
    setReplyFormOpenId(null);
  };

  const handleEdit = (commentId: number, content: string) => {
    editComment(commentId, content);
  };

  const handleDelete = (commentId: number) => {
    deleteComment(commentId);
  };

  const handleHide = (commentId: number, status: string) => {
    hideComment(commentId, status);
  };

  const currentUserId = user?.id;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Comentarios ({totalComments})
        </h2>
      </div>

      {!user ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Inicia sesión para comentar
          </p>
          <Link href="/login">
            <Button size="sm">Iniciar Sesión</Button>
          </Link>
        </div>
      ) : (
        <div className="mb-6">
          <CommentForm
            eventId={eventId}
            onSubmit={handleCreateComment}
            submitLabel="Publicar"
          />
        </div>
      )}

      {loading && comments.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error && comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Sé el primero en comentar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isOrganizerOrAdmin={isOrganizerOrAdmin}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHide={handleHide}
              onReplySubmit={handleReplySubmit}
              replyFormOpenId={replyFormOpenId}
              onCancelReply={handleCancelReply}
              isSubmitting={isSubmitting}
              eventId={eventId}
              token={token}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onClick={loadMore}
            isLoading={loading}
            disabled={loading}
          >
            Cargar más comentarios
          </Button>
        </div>
      )}
    </div>
  );
};
