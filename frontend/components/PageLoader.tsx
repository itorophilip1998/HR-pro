'use client';

import LoadingSpinner from './LoadingSpinner';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Loading Hr-Pro..." />
      </div>
    </div>
  );
}

