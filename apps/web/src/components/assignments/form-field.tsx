import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

export function FormField({ label, error, children, className, required }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-bold text-text-primary">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-accent font-medium">{error}</p>
      )}
    </div>
  );
}
