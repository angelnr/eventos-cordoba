import { useState, useCallback } from 'react';

interface UseUploadImageProps {
  eventId: string;
  onSuccess?: (imageUrl: string) => void;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const useUploadImage = ({ eventId, onSuccess }: UseUploadImageProps) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/events/${eventId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      setStatus('success');
      if (onSuccess) {
        onSuccess(imageUrl);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [eventId, onSuccess]);

  return { uploadImage, status, error, setStatus };
};
