import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';

interface TicketScannerProps {
  onScan: (token: string) => void;
  disabled?: boolean;
}

export const TicketScanner: React.FC<TicketScannerProps> = ({ onScan, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scanningRef = useRef(false);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      scanningRef.current = true;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraError('Permiso de cámara denegado');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No se encontró cámara disponible');
      } else {
        setCameraError('Error al acceder a la cámara');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    intervalRef.current = setInterval(() => {
      if (!scanningRef.current || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        const url = code.data;
        const tokenMatch = url.match(/\/tickets\/verify\/([a-f0-9-]+)/i);
        const token = tokenMatch ? tokenMatch[1] : url;

        if (token && token.length === 36 && token.includes('-')) {
          scanningRef.current = false;
          stopCamera();
          onScan(token);
        }
      }
    }, 300);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cameraActive, onScan, stopCamera]);

  return (
    <div className="mb-4">
      {!cameraActive && !cameraError && (
        <button
          type="button"
          onClick={startCamera}
          disabled={disabled}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
        >
          {disabled ? 'Escaneando...' : 'Escanear QR con Cámara'}
        </button>
      )}

      {cameraError && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md mb-2">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">{cameraError}</p>
          <button
            type="button"
            onClick={() => setCameraError(null)}
            className="mt-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            Escaneando...
          </div>
          <button
            type="button"
            onClick={stopCamera}
            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
          >
            Cancelar
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};
