import { cn } from '@/lib/cn';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass';
}

const variantMap = {
  default: 'bg-surface shadow-[var(--shadow-card)]',
  glass: 'bg-surface-card backdrop-blur-sm',
};

export function Card({ children, variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-3xl', variantMap[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
