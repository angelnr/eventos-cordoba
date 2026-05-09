import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';

interface CommentFormProps {
  eventId: number;
  parentId?: number | null;
  initialContent?: string;
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isEditing?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  eventId,
  parentId,
  initialContent = '',
  onSubmit,
  onCancel,
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Publicar',
  isEditing = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing, content.length]);

  const maxLength = 1000;
  const isValid = content.trim().length > 0 && content.trim().length <= maxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSubmit(content.trim());
    setIsSubmitting(false);

    if (success) {
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={maxLength + 1}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            {content.length > maxLength - 100 ? (
              <span className={content.length > maxLength ? 'text-red-500' : 'text-gray-400'}>
                {content.length}/{maxLength}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
