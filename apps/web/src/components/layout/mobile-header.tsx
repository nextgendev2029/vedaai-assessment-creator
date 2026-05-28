import { cn } from '@/lib/cn';
import { AppLogo } from '@/components/brand/app-logo';
import { IconButton } from '@/components/ui/icon-button';
import { Bell, Menu } from 'lucide-react';

interface MobileHeaderProps {
  className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
  return (
    <div
      className={cn(
        'flex lg:hidden items-center justify-between bg-surface rounded-2xl px-4 h-14 mx-auto w-full max-w-[var(--mobile-content-max)] shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <AppLogo size="sm" showText={true} />

      <div className="flex items-center gap-1">
        <IconButton label="Notifications" variant="ghost" size="sm" className="relative">
          <Bell size={18} className="text-text-primary" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent" />
        </IconButton>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-[10px] font-bold text-primary">
          JD
        </div>
        <IconButton label="Menu" variant="ghost" size="sm">
          <Menu size={18} className="text-text-primary" />
        </IconButton>
      </div>
    </div>
  );
}
