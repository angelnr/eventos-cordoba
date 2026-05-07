# Implementación UI para subir imagen de Event

## 1. Hook useUploadImage - frontend/lib/useUploadImage.ts

```typescript
import { useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UseUploadImageOptions {
  eventId: string;
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

interface UseUploadImageReturn {
  uploadImage: (file: File) => Promise