import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export default function SkeletonLoader({ count = 12 }: SkeletonLoaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex justify-between pt-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
