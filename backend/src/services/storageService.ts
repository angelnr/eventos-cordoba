import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../middleware/upload';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const EVENTS_DIR = path.join(UPLOAD_DIR, 'events');

interface MagicSignature {
  mime: string;
  ext: string;
  bytes: number[][];
  ranges?: number[][];
}

const MAGIC_BYTES: MagicSignature[] = [
  { mime: 'image/jpeg', ext: 'jpg',  bytes: [[0xFF, 0xD8, 0xFF]] },
  { mime: 'image/png',  ext: 'png',  bytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]] },
  { mime: 'image/webp', ext: 'webp', bytes: [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]], ranges: [[0, 4], [8, 12]] },
  { mime: 'image/gif',  ext: 'gif',  bytes: [[0x47, 0x49, 0x46, 0x38]] },
];

function detectImageType(buffer: Buffer): { mime: string; ext: string } | null {
  for (const sig of MAGIC_BYTES) {
    if (sig.ranges) {
      let match = true;
      for (let i = 0; i < sig.bytes.length; i++) {
        const [start, end] = sig.ranges[i];
        const slice = Buffer.from(sig.bytes[i]);
        const bufSlice = buffer.slice(start, end);
        if (bufSlice.length < slice.length || !slice.equals(bufSlice.subarray(0, slice.length))) {
          match = false;
          break;
        }
      }
      if (match) return { mime: sig.mime, ext: sig.ext };
    } else {
      const sigBuf = Buffer.from(sig.bytes[0]);
      const bufSlice = buffer.subarray(0, sigBuf.length);
      if (bufSlice.length >= sigBuf.length && sigBuf.equals(bufSlice)) {
        return { mime: sig.mime, ext: sig.ext };
      }
    }
  }
  return null;
}

async function ensureUploadDir(): Promise<void> {
  await fs.promises.mkdir(EVENTS_DIR, { recursive: true });
}

export function isLocalImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  return imageUrl.startsWith('/uploads/');
}

export function getFilePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  return path.join(UPLOAD_DIR, imageUrl.replace('/uploads/', ''));
}

export async function validateImageBuffer(buffer: Buffer): Promise<{ mime: string; ext: string }> {
  if (!buffer || buffer.length === 0) {
    throw new Error('EMPTY_BUFFER');
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE');
  }

  const detected = detectImageType(buffer);
  if (!detected) {
    throw new Error('INVALID_FILE_TYPE');
  }

  if (!ALLOWED_MIME_TYPES.includes(detected.mime)) {
    throw new Error('INVALID_MIME_TYPE');
  }

  const ext = '.' + detected.ext;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('INVALID_EXTENSION');
  }

  return detected;
}

export async function saveImage(buffer: Buffer, originalExtension: string): Promise<string> {
  await ensureUploadDir();

  const validated = await validateImageBuffer(buffer);

  const filename = crypto.randomUUID() + '.' + validated.ext;
  const filePath = path.join(EVENTS_DIR, filename);

  // Path traversal prevention
  const resolvedPath = path.resolve(filePath);
  const resolvedDir = path.resolve(EVENTS_DIR);
  if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
    throw new Error('PATH_TRAVERSAL_DETECTED');
  }

  await fs.promises.writeFile(filePath, buffer);

  return '/uploads/events/' + filename;
}

export async function deleteImage(imageUrl: string | null | undefined): Promise<void> {
  if (!isLocalImage(imageUrl)) {
    return;
  }

  const filePath = getFilePath(imageUrl);
  if (!filePath) return;
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('[STORAGE] Error deleting image file:', error);
    }
  }
}

export async function replaceImage(newBuffer: Buffer, newExtension: string, oldImageUrl: string | null | undefined): Promise<string> {
  const newPath = await saveImage(newBuffer, newExtension);

  if (oldImageUrl) {
    await deleteImage(oldImageUrl).catch(() => {});
  }

  return newPath;
}

export { UPLOAD_DIR };
export { EVENTS_DIR };
