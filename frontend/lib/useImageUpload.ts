import { useState, useCallback, useRef, useEffect } from 'react';

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type ImageSource =
  | { type: 'file'; file: File; previewUrl: string }
  | { type: 'external'; url: string }
  | null;

interface UseImageUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  imageSource: ImageSource;
  uploadError: string | null;
  selectFile: (file: File | null) => void;
  setExternalUrl: (url: string) => void;
  removeImage: () => void;
  getFormDataImage: () => File | null;
  reset: () => void;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
  const maxFileSize = options?.maxFileSize ?? DEFAULT_MAX_SIZE;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  const [imageSource, setImageSource] = useState<ImageSource>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const selectFile = useCallback((file: File | null) => {
    setUploadError(null);

    // Cleanup previous preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setImageSource(null);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      const error = `Tipo de archivo no permitido. Solo se aceptan: ${allowedTypes.join(', ')}`;
      setUploadError(error);
      options?.onError?.(error);
      return;
    }

    if (file.size > maxFileSize) {
      const error = `El archivo excede el tamaño máximo de ${Math.round(maxFileSize / 1024 / 1024)}MB`;
      setUploadError(error);
      options?.onError?.(error);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setImageSource({ type: 'file', file, previewUrl });
  }, [maxFileSize, allowedTypes, options]);

  const setExternalUrl = useCallback((url: string) => {
    setUploadError(null);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImageSource({ type: 'external', url });
  }, []);

  const removeImage = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageSource(null);
    setUploadError(null);
  }, []);

  const getFormDataImage = useCallback(() => {
    if (imageSource?.type === 'file') {
      return imageSource.file;
    }
    return null;
  }, [imageSource]);

  const reset = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageSource(null);
    setUploadError(null);
  }, []);

  return {
    imageSource,
    uploadError,
    selectFile,
    setExternalUrl,
    removeImage,
    getFormDataImage,
    reset,
  };
}