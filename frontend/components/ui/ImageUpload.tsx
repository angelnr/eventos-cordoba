import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useImageUpload } from '../../lib/useImageUpload';
import { getImageUrl } from '../../lib/imageUtils';

const ALLOWED_TYPES_LABEL = 'JPEG, PNG o WebP';
const MAX_SIZE_LABEL = '5MB';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  mode: 'create' | 'edit';
  onImageChange: (data: { file: File | null; externalUrl: string | null; removed: boolean }) => void;
  onError?: (error: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  mode,
  onImageChange,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    imageSource,
    uploadError,
    selectFile,
    removeImage,
  } = useImageUpload({ onError });

  const handleFileSelect = (file: File | null) => {
    selectFile(file);
    if (file) {
      onImageChange({ file, externalUrl: null, removed: false });
    }
  };

  const handleRemove = () => {
    removeImage();
    onImageChange({ file: null, externalUrl: null, removed: true });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
    e.target.value = '';
  };

  const displayUrl = imageSource?.type === 'file'
    ? imageSource.previewUrl
    : imageSource?.type === 'external'
      ? imageSource.url
      : currentImageUrl
        ? getImageUrl(currentImageUrl)
        : null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Imagen del Evento
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          <div className="relative">
            <img
              src={displayUrl}
              alt="Vista previa"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 bg-white/90 text-gray-700 dark:bg-gray-800/90 dark:text-gray-200 text-xs rounded hover:bg-white dark:hover:bg-gray-700 shadow"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-2 py-1 bg-red-500/90 text-white text-xs rounded hover:bg-red-600 dark:hover:bg-red-700 shadow"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {ALLOWED_TYPES_LABEL} · Máximo {MAX_SIZE_LABEL}
            </p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Seleccionar imagen del evento"
      />

      {uploadError && (
        <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
      )}
    </div>
  );
};