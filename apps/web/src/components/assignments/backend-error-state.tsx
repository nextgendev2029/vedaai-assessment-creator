import { cn } from '@/lib/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackendErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function BackendErrorState({
  message = 'Unable to connect to the server. Make sure the API is running.',
  onRetry,
  className,
}: BackendErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 lg:py-24 px-6', className)}>
      <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
        <AlertTriangle size={28} className="text-accent" />
      </div>

      <h2 className="mt-6 text-xl font-bold text-text-primary text-center">
        Connection Error
      </h2>

      <p className="mt-3 text-sm text-text-muted text-center max-w-md leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          icon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
