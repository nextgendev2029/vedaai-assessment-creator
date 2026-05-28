import { cn } from '@/lib/cn';

interface AssignmentLoadingStateProps {
  className?: string;
}

export function AssignmentLoadingState({ className }: AssignmentLoadingStateProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Skeleton search bar */}
      <div className="bg-surface rounded-2xl lg:rounded-[20px] h-16 mb-4 lg:mb-5 animate-pulse" />

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-3xl h-[116px] lg:h-[162px] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
