import { useState, useEffect } from 'react';

export default function Home() {
  const [backendMessage, setBackendMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determinar la URL del API
    const apiUrl = window.location.hostname === 'eventoscordoba.xyz'
    ? 'https://api.eventoscordoba.xyz'
    : 'http://localhost:3001';

    console.log('Conectando a:', apiUrl);

    fetch(`${apiUrl}/api/test`)
    .then(response => {
      if (!response.ok) throw new Error('Error HTTP: ' + response.status);
      return response.json();
    })
    .then(data => {
      setBackendMessage(data.message);
      setLoading(false);
    })
    .catch(error => {
      setBackendMessage('Error conectando con el backend: ' + error.message);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
    <h1>🚀 ¡Mi App en Internet!</h1>
    <p>Frontend servido desde Cloudflare + Docker</p>

    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
    <h2>🔗 Estado de la Conexión Backend:</h2>
    {loading ? (
      <p>🔄 Probando conexión con backend...</p>
    ) : (
      <div style={{
        color: backendMessage.includes('Error') ? '#d32f2f' : '#2e7d32',
         backgroundColor: '#f5f5f5',
         padding: '15px',
         borderRadius: '5px',
         border: backendMessage.includes('Error') ? '1px solid #ffcdd2' : '1px solid #c8e6c9'
      }}>
      {backendMessage.includes('Error') ? '❌' : '✅'} {backendMessage}
      </div>
    )}
    </div>

    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '5px' }}>
    <h3>🎯 Servicios Configurados:</h3>
    <ul style={{ listStyle: 'none', padding: 0 }}>
    <li style={{ padding: '5px 0' }}>• 🌐 Frontend: <strong>https://eventoscordoba.xyz</strong></li>
    <li style={{ padding: '5px 0' }}>• ⚙️ Backend API: <strong>https://api.eventoscordoba.xyz/api/test</strong></li>
    <li style={{ padding: '5px 0' }}>• 🗄️ Base de datos: <strong>PostgreSQL en Docker</strong></li>
    <li style={{ padding: '5px 0' }}>• 🔒 Tunnel: <strong>Cloudflare Zero Trust</strong></li>
    </ul>
    </div>

    <div style={{ marginTop: '20px', fontSize: '12px', color: '#757575', textAlign: 'center' }}>
    <p>✨ Aplicación desplegada con Docker + Nginx + Cloudflare + PostgreSQL</p>
    </div>
    </div>
  );
}
