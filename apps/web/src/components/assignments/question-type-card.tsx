'use client';

import { cn } from '@/lib/cn';
import { ChevronDown, X, Minus, Plus } from 'lucide-react';

interface QuestionTypeCardProps {
  label: string;
  count: number;
  marks: number;
  onCountChange: (v: number) => void;
  onMarksChange: (v: number) => void;
  onRemove: () => void;
  className?: string;
}

interface CounterProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
}

function Counter({ value, min = 1, max = 50, onChange, label }: CounterProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] text-text-muted font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-full border border-black/15 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label={`Decrease ${label}`}
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-text-primary">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-full border border-black/15 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5"
          aria-label={`Increase ${label}`}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function QuestionTypeCard({
  label,
  count,
  marks,
  onCountChange,
  onMarksChange,
  onRemove,
  className,
}: QuestionTypeCardProps) {
  return (
    <div className={cn('bg-surface rounded-3xl p-3 lg:p-4', className)}>
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
            {label}
            <ChevronDown size={14} className="text-text-muted" />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
            aria-label={`Remove ${label}`}
          >
            <X size={14} className="text-text-muted" />
          </button>
        </div>
        <div className="flex items-end justify-center gap-6">
          <Counter value={count} onChange={onCountChange} label="No. of Questions" />
          <Counter value={marks} onChange={onMarksChange} label="Marks" max={100} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-black/10 text-sm font-medium text-text-primary min-w-0">
            <span className="truncate">{label}</span>
            <ChevronDown size={14} className="text-text-muted shrink-0" />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer shrink-0"
            aria-label={`Remove ${label}`}
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <Counter value={count} onChange={onCountChange} label="No. of Questions" />
          <Counter value={marks} onChange={onMarksChange} label="Marks" max={100} />
        </div>
      </div>
    </div>
  );
}
