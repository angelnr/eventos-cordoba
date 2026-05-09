import React, { useState } from 'react';
import { Button } from './ui/Button';
import { CommentForm } from './CommentForm';
import type { Comment } from '../lib/useComments';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: number;
  isOrganizerOrAdmin?: boolean;
  onReply: (parentId: number) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onHide?: (commentId: number, status: string) => void;
  onReplySubmit?: (parentId: number, content: string) => Promise<boolean>;
  replyFormOpenId: number | null;
  onCancelReply: () => void;
  isSubmitting: boolean;
  eventId: number;
  token: string | null;
  isReply?: boolean;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function isWithinEditWindow(createdAt: string): boolean {
  const EDIT_WINDOW_MS = 15 * 60 * 1000;
  const commentAge = Date.now() - new Date(createdAt).getTime();
  return commentAge <= EDIT_WINDOW_MS;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  isOrganizerOrAdmin,
  onReply,
  onEdit,
  onDelete,
  onHide,
  onReplySubmit,
  replyFormOpenId,
  onCancelReply,
  isSubmitting,
  eventId,
  token,
  isReply = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const isDeleted = comment.status === 'hidden' && comment.content === '[comentario eliminado]';
  const isHiddenByModeration = comment.status === 'hidden' && comment.content !== '[comentario eliminado]';
  const isOwnComment = currentUserId === comment.userId;
  const canEdit = isOwnComment && isWithinEditWindow(comment.createdAt) && !isDeleted;
  const canDelete = isOwnComment || isOrganizerOrAdmin;
  const canHide = isOrganizerOrAdmin && !isOwnComment && !isDeleted;

  const handleEditSubmit = async (content: string): Promise<boolean> => {
    return new Promise((resolve) => {
      onEdit(comment.id, content);
      setIsEditing(false);
      resolve(true);
    });
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que querés eliminar este comentario?')) {
      onDelete(comment.id);
    }
  };

  const handleHide = () => {
    const newStatus = comment.status === 'hidden' ? 'approved' : 'hidden';
    const action = newStatus === 'hidden' ? 'ocultar' : 'mostrar';
    if (window.confirm(`¿Estás seguro de que querés ${action} este comentario?`)) {
      onHide?.(comment.id, newStatus);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const getAvatarInitial = (name: string): string => {
    return name?.charAt(0)?.toUpperCase() || '?';
  };

  return (
    <article className={`${isReply ? 'ml-8 mt-2 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className={`${isReply ? '' : 'bg-white border border-gray-200 rounded-lg p-4'} ${isReply ? 'py-2' : ''}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {comment.user.avatar ? (
              <img
                src={comment.user.avatar}
                alt={comment.user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {getAvatarInitial(comment.user.name)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">{comment.user.name}</span>
              <span className="text-gray-400 text-xs">{formatRelativeDate(comment.createdAt)}</span>
              {isHiddenByModeration && (
                <span className="text-xs text-yellow-600 font-medium">Oculto</span>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2">
                <CommentForm
                  eventId={eventId}
                  initialContent={comment.content}
                  onSubmit={async (content) => {
                    const success = await handleEditSubmit(content);
                    return success;
                  }}
                  onCancel={handleCancelEdit}
                  submitLabel="Guardar"
                  isEditing
                />
              </div>
            ) : (
              <div className={`mt-1 text-sm ${isDeleted ? 'text-gray-400 italic' : isHiddenByModeration ? 'text-gray-400' : 'text-gray-700'}`}>
                {isDeleted ? '[comentario eliminado]' : isHiddenByModeration ? (
                  <span className="italic">Comentario oculto por moderación</span>
                ) : (
                  comment.content
                )}
              </div>
            )}

            {!isEditing && !isDeleted && (
              <div className="flex items-center gap-3 mt-2">
                {currentUserId && !isReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    aria-label="Responder al comentario"
                  >
                    Responder
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={handleStartEdit}
                    className="text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    aria-label="Editar comentario"
                  >
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors"
                    aria-label="Eliminar comentario"
                  >
                    Eliminar
                  </button>
                )}
                {canHide && (
                  <button
                    onClick={handleHide}
                    className="text-xs text-gray-500 hover:text-yellow-600 font-medium transition-colors"
                    aria-label={comment.status === 'hidden' ? 'Mostrar comentario' : 'Ocultar comentario'}
                  >
                    {comment.status === 'hidden' ? 'Mostrar' : 'Ocultar'}
                  </button>
                )}
              </div>
            )}

            {replyFormOpenId === comment.id && onReplySubmit && (
              <div className="mt-3">
                <CommentForm
                  eventId={eventId}
                  parentId={comment.id}
                  onSubmit={async (content) => {
                    return onReplySubmit(comment.id, content);
                  }}
                  onCancel={onCancelReply}
                  placeholder="Escribe una respuesta..."
                  submitLabel="Publicar respuesta"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && !isReply && (
        <div className="ml-8 mt-2 space-y-3 border-l-2 border-gray-200 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isOrganizerOrAdmin={isOrganizerOrAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onHide={onHide}
              onReplySubmit={onReplySubmit}
              replyFormOpenId={replyFormOpenId}
              onCancelReply={onCancelReply}
              isSubmitting={isSubmitting}
              eventId={eventId}
              token={token}
              isReply
            />
          ))}
        </div>
      )}
    </article>
  );
};
