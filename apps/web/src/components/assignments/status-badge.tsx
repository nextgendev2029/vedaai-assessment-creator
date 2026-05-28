import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
  queued: { label: 'Queued', bg: 'bg-amber-50', text: 'text-amber-700' },
  processing: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700' },
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'processing' && 'animate-pulse',
        status === 'draft' && 'bg-gray-400',
        status === 'queued' && 'bg-amber-500',
        status === 'processing' && 'bg-blue-500',
        status === 'completed' && 'bg-emerald-500',
        status === 'failed' && 'bg-red-500',
        status === 'active' && 'bg-emerald-500',
      )} />
      {config.label}
    </span>
  );
}
