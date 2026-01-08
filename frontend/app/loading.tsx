import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading Hr-Pro..." />
    </div>
  );
}

