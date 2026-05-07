// Ejemplo mínimo de fetch para POST /api/events/[id]/image
// Este ejemplo muestra cómo subir una imagen a un evento

// URL del endpoint (reemplazar {id} con el ID del evento y {token} con el token JWT)
const eventId = 1;
const apiUrl = `http://localhost:3001/api/events/${eventId}/image`;
const token = 'TU_TOKEN_JWT_AQUI';

// Crear FormData con la imagen
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]'); // Obtener archivo desde input

// Si estás en Node.js, puedes usar el módulo 'fs' y 'form-data'
/*
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file', fs.createReadStream('ruta/a/tu/imagen.jpg'), {
  filename: 'imagen.jpg',
  contentType: 'image/jpeg'
});
*/

// Ejemplo de fetch en el navegador
async function uploadImage() {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NOTA: No establecer Content-Type manualmente, el navegador lo hará automáticamente
        // con el boundary correcto para multipart/form-data
      },
      body: formData
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Imagen subida exitosamente:', result);
      console.log('📁 URL de la imagen:', result.data.imageUrl);
      console.log('🎯 Evento actualizado:', result.data.event);
    } else {
      console.error('❌ Error al subir imagen:', result.error);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// Ejemplo usando curl (desde terminal)
/*
curl -X POST http://localhost:3001/api/events/1/image \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/ruta/a/tu/imagen.jpg"
*/

// Ejemplo usando fetch en Node.js (con node-fetch o similar)
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
*/

console.log('📋 Ejemplo de uso del endpoint POST /api/events/[id]/image');
console.log('========================================================');
console.log('1. Reemplaza eventId y token con valores reales');
console.log('2. Asegúrate de que el evento exista y tengas permisos');
console.log('3. El archivo debe ser JPEG o PNG, máximo 5MB');
console.log('4. La imagen se guardará en /public/uploads/events/');
console.log('5. El nombre del archivo será: event-{id}.jpg o .png');