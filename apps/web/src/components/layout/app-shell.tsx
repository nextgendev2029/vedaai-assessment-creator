import { cn } from '@/lib/cn';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MobileHeader } from './mobile-header';
import { MobileBottomNav } from './mobile-bottom-nav';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileBottomNav />

      {/* Main content area */}
      <div className={cn('lg:ml-[328px] min-h-screen', className)}>
        {/* Mobile header */}
        <div className="lg:hidden pt-3 px-2.5">
          <MobileHeader />
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:block pt-3 pr-4">
          <TopBar />
        </div>

        {/* Page content */}
        <main className="px-2.5 lg:px-4 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
