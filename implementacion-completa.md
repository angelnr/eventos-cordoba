# Implementación POST /api/events/[id]/image

## 1. Función saveFile(file, id) - backend/src/utils/fileUpload.js

```javascript
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

/**
 * Guarda un archivo de imagen en el sistema de archivos
 * @param {Object} file - Objeto de archivo con stream y metadata
 * @param {number} eventId - ID del evento
 * @returns {Promise<string>} Ruta pública del archivo guardado
 */
async function saveFile(file, eventId) {
  // Validar tipo MIME
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido. Solo se aceptan JPEG y PNG.');
  }

  // Validar tamaño máximo (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes
  if (file.size > maxSize) {
    throw new Error('El archivo excede el tamaño máximo de 5MB.');
  }

  // Determinar extensión basada en el tipo MIME
  const extension = file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
  
  // Crear nombre de archivo
  const filename = `event-${eventId}${extension}`;
  
  // Ruta completa del directorio
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'events');
  
  // Crear directorio si no existe
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Ruta completa del archivo
  const filePath = path.join(uploadDir, filename);
  
  // Si ya existe un archivo con el mismo nombre, eliminarlo
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    // El archivo no existe, continuar normalmente
  }
  
  // Guardar el archivo
  await pipeline(
    file.stream(),
    fs.createWriteStream(filePath)
  );
  
  // Retornar ruta pública (relativa a /public)
  return `/uploads/events/${filename}`;
}

module.exports = { saveFile };
```

## 2. Endpoint POST /api/events/[id]/image - backend/src/routes/events.js (extracto)

```javascript
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { saveFile } = require('../utils/fileUpload');

const router = express.Router();
const prisma = new PrismaClient();

// ... (middlewares y otras rutas existentes) ...

// POST /api/events/:id/image - Subir imagen para evento
router.post('/:id/image', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este evento'
      });
    }

    // Verificar que la solicitud es multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type debe ser multipart/form-data'
      });
    }

    // Obtener el límite de tamaño del body
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (contentLength > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'El archivo excede el tamaño máximo de 5MB'
      });
    }

    // Parsear multipart/form-data manualmente
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({
        success: false,
        error: 'Formato multipart/form-data inválido'
      });
    }

    // Leer el body completo
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // Buscar el campo "file" en el body multipart
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = splitBufferByBoundary(bodyBuffer, boundaryBuffer);
    
    let fileData = null;
    let fileName = null;
    let fileType = null;

    for (const part of parts) {
      if (part.length === 0) continue;
      
      const partStr = part.toString('utf8');
      const headerEnd = partStr.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      
      const headers = partStr.substring(0, headerEnd);
      const content = part.slice(headerEnd + 4);
      
      // Buscar el campo "file"
      if (headers.includes('name="file"')) {
        // Extraer nombre de archivo y tipo
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);
        
        if (filenameMatch && contentTypeMatch) {
          fileName = filenameMatch[1];
          fileType = contentTypeMatch[1].trim();
          fileData = content;
          break;
        }
      }
    }

    if (!fileData || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'Campo "file" no encontrado en la solicitud'
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no permitido. Solo se aceptan JPEG y PNG'
      });
    }

    // Crear objeto de archivo para saveFile
    const file = {
      mimetype: fileType,
      size: fileData.length,
      stream: () => {
        const { Readable } = require('stream');
        const readable = new Readable();
        readable.push(fileData);
        readable.push(null);
        return readable;
      }
    };

    // Guardar el archivo
    const imageUrl = await saveFile(file, parseInt(id));

    // Actualizar el evento en la base de datos
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { imageUrl },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        event: updatedEvent,
        imageUrl
      }
    });

  } catch (error) {
    console.error('Upload image error:', error);
    
    if (error.message.includes('Tipo de archivo no permitido') || 
        error.message.includes('excede el tamaño máximo')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir imagen'
    });
  }
});

// Función auxiliar para dividir buffer por boundary
function splitBufferByBoundary(buffer, boundary) {
  const parts = [];
  let start = 0;
  
  while (start < buffer.length) {
    // Encontrar el siguiente boundary
    const boundaryIndex = buffer.indexOf(boundary, start);
    if (boundaryIndex === -1) break;
    
    // Saltar el boundary y el CRLF
    const partStart = start;
    const partEnd = boundaryIndex;
    
    if (partEnd > partStart) {
      parts.push(buffer.slice(partStart, partEnd));
    }
    
    // Mover el inicio después del boundary
    start = boundaryIndex + boundary.length;
    
    // Si el siguiente byte es '--', es el boundary final
    if (buffer[start] === 0x2D && buffer[start + 1] === 0x2D) {
      break;
    }
    
    // Saltar CRLF después del boundary
    if (buffer[start] === 0x0D && buffer[start + 1] === 0x0A) {
      start += 2;
    }
  }
  
  return parts;
}
```

## 3. Ejemplo fetch mínimo

```javascript
// Ejemplo en navegador
const eventId = 1;
const apiUrl = `http://localhost:3001/api/events/${eventId}/image`;
const token = 'TU_TOKEN_JWT_AQUI';

async function uploadImage() {
  const formData = new FormData();
  const fileInput = document.querySelector('input[type="file"]');
  formData.append('file', fileInput.files[0]);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  console.log(result);
}

// Ejemplo con curl
/*
curl -X POST http://localhost:3001/api/events/1/image \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/ruta/a/tu/imagen.jpg"
*/

// Ejemplo en Node.js con node-fetch
/*
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadImageNode() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('./imagen.jpg'), {
    filename: 'imagen.jpg',
    contentType: 'image/jpeg'
  });

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const result = await response.json();
  console.log(result);
}
```

## Características implementadas

✅ **Subida local de imagen** - Guarda en `/public/uploads/events/`  
✅ **Actualizar imageUrl** - Actualiza el campo `imageUrl` en la base de datos  
✅ **Tipos permitidos** - Solo `image/jpeg` y `image/png`  
✅ **Tamaño máximo** - 5MB  
✅ **Nombre del archivo** - `event-{id}.ext` (sobrescribe si existe)  
✅ **APIs nativas** - Usa `fs`, `path`, `stream` sin librerías externas  
✅ **Validaciones** - Tipo MIME, tamaño, permisos, existencia del evento  
✅ **Autenticación** - Requiere token JWT y permisos de organizador/admin  
✅ **Manejo de errores** - Respuestas JSON con `success`, `error`, `message`