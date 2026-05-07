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