import React, { useRef, useState, useCallback } from 'react';
import { useImageUpload } from '../../lib/useImageUpload';
import { getImageUrl } from '../../lib/imageUtils';

const MAX_SIZE_MB = 5;

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  uploadError?: string | null;
  isUploading?: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  onFileSelect,
  onRemove,
  uploadError,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    imageSource,
    uploadError: localError,
    selectFile,
    removeImage,
  } = useImageUpload({
    onError: () => {},
  });

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    selectFile(file);
    onFileSelect(file);
  }, [selectFile, onFileSelect]);

  const handleRemove = useCallback(() => {
    removeImage();
    onRemove();
  }, [removeImage, onRemove]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const displayUrl = imageSource?.type === 'file'
    ? imageSource.previewUrl
    : currentAvatarUrl
      ? getImageUrl(currentAvatarUrl) || undefined
      : undefined;

  const initials = userName
    ? userName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        className={`relative group ${
          isDragging ? 'ring-4 ring-blue-500' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center text-white font-semibold text-2xl border-2 border-gray-200 dark:border-gray-600">
            {initials}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {!isUploading && (
          <div
            className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.229A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.229A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Seleccionar imagen de perfil"
      />

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
        >
          Cambiar foto
        </button>
        {currentAvatarUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPEG, PNG o WebP &middot; M&aacute;ximo {MAX_SIZE_MB}MB
      </p>

      {(uploadError || localError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {uploadError || localError}
        </p>
      )}
    </div>
  );
};
