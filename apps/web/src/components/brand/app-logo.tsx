import { cn } from '@/lib/cn';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'h-8 w-8 rounded-lg', text: 'text-lg', vSize: 'text-base' },
  md: { box: 'h-10 w-10 rounded-xl', text: 'text-xl', vSize: 'text-lg' },
  lg: { box: 'h-12 w-12 rounded-xl', text: 'text-2xl', vSize: 'text-xl' },
};

export function AppLogo({ size = 'md', showText = true, className }: AppLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex items-center justify-center bg-primary',
          s.box,
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn('text-white', s.vSize, 'w-[60%] h-[60%]')}
        >
          <path
            d="M6 6L12 18L18 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-text-primary', s.text)}>
          VedaAI
        </span>
      )}
    </div>
  );
}
