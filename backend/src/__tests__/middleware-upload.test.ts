/// <reference types="jest" />

import path from 'path';

const mockMkdir = jest.fn();
const mockWriteFile = jest.fn();
const mockAccess = jest.fn();
const mockUnlink = jest.fn();

jest.mock('fs', () => ({
  promises: {
    mkdir: mockMkdir,
    writeFile: mockWriteFile,
    access: mockAccess,
    unlink: mockUnlink,
  },
}));

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
}));

const MOCK_PNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
]);

const MOCK_WEBP = Buffer.from([
  0x52, 0x49, 0x46, 0x46, // RIFF
  0x00, 0x00, 0x00, 0x00, // size
  0x57, 0x45, 0x42, 0x50, // WEBP
]);

const MOCK_JPEG = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);

beforeEach(() => {
  mockMkdir.mockReset();
  mockWriteFile.mockReset();
  mockAccess.mockReset();
  mockUnlink.mockReset();
});

describe('storageService - validateImageBuffer', () => {
  let validateImageBuffer: (buffer: Buffer) => Promise<any>;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    validateImageBuffer = mod.validateImageBuffer;
  });

  it('debe lanzar EMPTY_BUFFER si el buffer está vacío', async () => {
    await expect(validateImageBuffer(Buffer.from([]))).rejects.toThrow('EMPTY_BUFFER');
  });

  it('debe lanzar FILE_TOO_LARGE si el archivo excede 5MB', async () => {
    const large = Buffer.alloc(6 * 1024 * 1024 + 1);
    await expect(validateImageBuffer(large)).rejects.toThrow('FILE_TOO_LARGE');
  });

  it('debe lanzar INVALID_FILE_TYPE si no se reconoce el tipo', async () => {
    const invalid = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    await expect(validateImageBuffer(invalid)).rejects.toThrow('INVALID_FILE_TYPE');
  });

  it('debe aceptar PNG válido y devolver mime+ext', async () => {
    const result = await validateImageBuffer(MOCK_PNG);
    expect(result.mime).toBe('image/png');
    expect(result.ext).toBe('png');
  });

  it('debe aceptar JPEG válido', async () => {
    const result = await validateImageBuffer(MOCK_JPEG);
    expect(result.mime).toBe('image/jpeg');
    expect(result.ext).toBe('jpg');
  });

  it('debe aceptar WebP válido', async () => {
    const result = await validateImageBuffer(MOCK_WEBP);
    expect(result.mime).toBe('image/webp');
    expect(result.ext).toBe('webp');
  });
});

describe('storageService - isLocalImage', () => {
  let isLocalImage: (url: string | null | undefined) => boolean;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    isLocalImage = mod.isLocalImage;
  });

  it('debe retornar false para null', () => {
    expect(isLocalImage(null)).toBe(false);
  });

  it('debe retornar false para undefined', () => {
    expect(isLocalImage(undefined)).toBe(false);
  });

  it('debe retornar false para URLs externas', () => {
    expect(isLocalImage('https://example.com/img.jpg')).toBe(false);
  });

  it('debe retornar true para rutas que empiezan con /uploads/', () => {
    expect(isLocalImage('/uploads/events/x.png')).toBe(true);
  });
});

describe('storageService - saveImage', () => {
  let saveImage: (buffer: Buffer, ext: string) => Promise<string>;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    saveImage = mod.saveImage;
  });

  it('debe validar, crear directorio y escribir archivo', async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await saveImage(MOCK_PNG, '.png');

    expect(result).toMatch(/^\/uploads\/events\/.+\.png$/);
    expect(result).toContain('550e8400');
    expect(mockMkdir).toHaveBeenCalled();
    expect(mockWriteFile).toHaveBeenCalled();
  });
});

describe('storageService - saveAvatarImage', () => {
  let saveAvatarImage: (buffer: Buffer, ext: string) => Promise<string>;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    saveAvatarImage = mod.saveAvatarImage;
  });

  it('debe guardar en /uploads/avatars/', async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await saveAvatarImage(MOCK_PNG, '.png');

    expect(result).toMatch(/^\/uploads\/avatars\/.+\.png$/);
  });
});

describe('storageService - deleteImage', () => {
  let deleteImage: (url: string | null | undefined) => Promise<void>;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    deleteImage = mod.deleteImage;
  });

  it('no debe hacer nada si la imagen es externa', async () => {
    await deleteImage('https://example.com/img.jpg');
    expect(mockAccess).not.toHaveBeenCalled();
  });

  it('debe eliminar archivo local si existe', async () => {
    mockAccess.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);

    await deleteImage('/uploads/events/test.png');

    expect(mockAccess).toHaveBeenCalled();
    expect(mockUnlink).toHaveBeenCalled();
  });

  it('no debe fallar si el archivo no existe (ENOENT)', async () => {
    mockAccess.mockRejectedValue({ code: 'ENOENT' });

    await deleteImage('/uploads/events/test.png');

    expect(mockAccess).toHaveBeenCalled();
    expect(mockUnlink).not.toHaveBeenCalled();
  });
});

describe('storageService - replaceImage', () => {
  let replaceImage: (newBuffer: Buffer, newExtension: string, oldImageUrl: string | null | undefined) => Promise<string>;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    replaceImage = mod.replaceImage;
  });

  it('debe guardar nueva imagen y eliminar la vieja', async () => {
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);
    mockAccess.mockResolvedValue(undefined);
    mockUnlink.mockResolvedValue(undefined);

    const result = await replaceImage(MOCK_PNG, '.png', '/uploads/events/old.png');

    expect(result).toMatch(/^\/uploads\/events\/.+\.png$/);
    expect(mockUnlink).toHaveBeenCalled();
  });
});

describe('storageService - getFilePath', () => {
  let getFilePath: (url: string | null | undefined) => string | null;

  beforeAll(async () => {
    const mod = await import('../services/storageService');
    getFilePath = mod.getFilePath;
  });

  it('debe retornar null para null', () => {
    expect(getFilePath(null)).toBeNull();
  });

  it('debe unir UPLOAD_DIR con la ruta relativa', () => {
    const result = getFilePath('/uploads/events/x.png');
    expect(result).toBeDefined();
    expect(result).toContain('uploads');
    expect(result).toContain('events');
    expect(result).toContain('x.png');
  });
});

describe('upload middleware - multer config', () => {
  it('ALLOWED_MIME_TYPES debe contener JPEG, PNG y WebP', async () => {
    const { ALLOWED_MIME_TYPES } = await import('../middleware/upload');
    expect(ALLOWED_MIME_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('ALLOWED_EXTENSIONS debe contener .jpg, .jpeg, .png, .webp', async () => {
    const { ALLOWED_EXTENSIONS } = await import('../middleware/upload');
    expect(ALLOWED_EXTENSIONS).toEqual(['.jpg', '.jpeg', '.png', '.webp']);
  });

  it('MAX_FILE_SIZE debe ser 5MB', async () => {
    const { MAX_FILE_SIZE } = await import('../middleware/upload');
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });
});
