import React, { useState, useRef, ChangeEvent } from 'react';
import { useUploadImage } from '../../lib/useUploadImage';

interface ImageUploadProps {
  eventId: string;
  currentImageUrl?: string | null;
  onUploadSuccess?: (newImageUrl: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  eventId,
  currentImageUrl,
  onUploadSuccess,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, status, error } = useUploadImage({
    eventId,
    onSuccess: (url) => {
      setPreviewUrl(url);
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess(url);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError('Solo se permiten imágenes JPG o PNG');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError('La imagen no debe superar los 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadImage(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50">
      <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500">Sin imagen</span>
        )}
        
        {status === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white animate-pulse">Subiendo...</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          onClick={triggerFileInput}
          disabled={status === 'uploading'}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </button>

        {selectedFile && status !== 'uploading' && (
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Subir ahora
          </button>
        )}
      </div>

      {validationError && (
        <p className="text-red-500 text-sm">{validationError}</p>
      )}
      
      {status === 'error' && (
        <p className="text-red-500 text-sm">{error || 'Error al subir la imagen'}</p>
      )}
      
      {status === 'success' && (
        <p className="text-green-500 text-sm">Imagen actualizada con éxito</p>
      )}
    </div>
  );
};
