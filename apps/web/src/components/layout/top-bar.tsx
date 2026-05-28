import { cn } from '@/lib/cn';
import { ArrowLeft, Bell, ChevronDown, Grid2x2 } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  return (
    <div
      className={cn(
        'hidden lg:flex items-center justify-between bg-surface rounded-2xl px-5 h-14 shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-3">
        <IconButton label="Go back" variant="ghost">
          <ArrowLeft size={20} className="text-text-primary" />
        </IconButton>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Grid2x2 size={16} />
          <span className="font-medium">Assignment</span>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        <IconButton label="Notifications" variant="ghost" className="relative">
          <Bell size={20} className="text-text-primary" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </IconButton>
        <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-xs font-bold text-primary">
            JD
          </div>
          <span className="text-sm font-medium text-text-primary">John Doe</span>
          <ChevronDown size={16} className="text-text-muted" />
        </button>
      </div>
    </div>
  );
}
