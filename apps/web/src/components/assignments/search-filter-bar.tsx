import { cn } from '@/lib/cn';
import { Filter, Search } from 'lucide-react';

interface SearchFilterBarProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchFilterBar({ className, value, onChange }: SearchFilterBarProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl lg:rounded-[20px] h-16 px-4 lg:px-5',
        'flex items-center gap-3 lg:justify-between',
        'w-full max-w-[var(--mobile-content-max)] lg:max-w-none mx-auto lg:mx-0',
        'shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Filter button */}
      <button className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0">
        <Filter size={16} />
        <span className="hidden lg:inline font-medium">Filter By</span>
        <span className="lg:hidden font-medium">Filter</span>
      </button>

      {/* Divider - desktop only */}
      <div className="hidden lg:block h-8 w-px bg-black/10" />

      {/* Search input */}
      <div className="flex-1 lg:flex-none lg:w-[280px]">
        <div className="flex items-center gap-2 h-11 px-4 rounded-full border border-black/10 bg-transparent">
          <Search size={16} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search Name"
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
          />
        </div>
      </div>
    </div>
  );
}
