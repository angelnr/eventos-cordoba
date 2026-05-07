import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { ImageUpload } from '../../components/ui/ImageUpload';

const EventPageExample = () => {
  // Simulando un estado de evento obtenido de una API
  const [event, setEvent] = useState({
    id: '123',
    title: 'Concierto de Jazz en Córdoba',
    description: 'Una noche inolvidable de jazz bajo las estrellas.',
    imageUrl: null as string | null,
  });

  const handleUploadSuccess = (newImageUrl: string) => {
    // Actualización inmediata de la UI
    setEvent((prev) => ({ ...prev, imageUrl: newImageUrl }));
    console.log('Imagen del evento actualizada:', newImageUrl);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <p className="text-gray-600 mb-8">{event.description}</p>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Imagen del Evento</h2>
          <ImageUpload
            eventId={event.id}
            currentImageUrl={event.imageUrl}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-md">
          <h3 className="font-bold text-blue-800">Estado actual de la entidad:</h3>
          <pre className="mt-2 text-sm text-blue-600 overflow-auto">
            {JSON.stringify(event, null, 2)}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default EventPageExample;
