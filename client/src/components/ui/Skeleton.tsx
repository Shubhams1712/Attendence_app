interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
            </div>
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        </div>
      ))}
    </div>
  );
}
