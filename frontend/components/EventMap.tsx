import React from 'react';
import dynamic from 'next/dynamic';

interface EventMapProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const EventMapInner = dynamic(
  () => import('./EventMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

export default function EventMap(props: EventMapProps) {
  return <EventMapInner {...props} />;
}