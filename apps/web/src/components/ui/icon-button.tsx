'use client';

import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'surface';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const variantMap = {
  default: 'bg-white/25 backdrop-blur-sm hover:bg-white/40',
  ghost: 'bg-transparent hover:bg-black/5',
  surface: 'bg-surface hover:bg-surface-soft',
};

export function IconButton({
  children,
  label,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
        'active:scale-95',
        sizeMap[size],
        variantMap[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
