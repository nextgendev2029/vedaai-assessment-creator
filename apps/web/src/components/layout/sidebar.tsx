'use client';

import { cn } from '@/lib/cn';
import { AppLogo } from '@/components/brand/app-logo';
import { Button } from '@/components/ui/button';
import {
  Grid2x2,
  Users,
  ClipboardList,
  BookOpen,
  Sparkles,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchAssignments } from '@/lib/api-client';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Grid2x2,
  Users,
  ClipboardList,
  BookOpen,
  Sparkles,
};

interface SidebarNavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

const navItems: SidebarNavItem[] = [
  { label: 'Home', icon: 'Grid2x2', href: '/' },
  { label: 'My Groups', icon: 'Users', href: '/groups' },
  { label: 'Assignments', icon: 'ClipboardList', href: '/assignments', badge: 0 },
  { label: "AI Teacher's Toolkit", icon: 'Sparkles', href: '/toolkit' },
  { label: 'My Library', icon: 'BookOpen', href: '/library' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    fetchAssignments({ limit: 1 })
      .then((res) => {
        setTotalCount(res.total);
      })
      .catch((err) => {
        console.error('Failed to fetch assignments count in sidebar:', err);
      });
  }, [pathname]);

  return (
    <aside className="hidden lg:flex fixed left-3 top-3 bottom-3 w-[304px] flex-col bg-surface rounded-2xl p-6 shadow-[var(--shadow-sidebar)] z-40">
      {/* Logo */}
      <div className="mb-8">
        <AppLogo size="md" />
      </div>

      {/* Create Assignment Button */}
      <Link href="/assignments/create" className="block w-full mb-6">
        <Button
          variant="primary"
          className="w-full rounded-xl h-12 text-sm font-semibold border border-accent/30"
          icon={<Sparkles size={16} />}
        >
          Create Assignment
        </Button>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const badgeValue = item.href === '/assignments' ? totalCount : item.badge;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-surface-soft text-text-primary font-semibold'
                  : 'text-text-secondary hover:bg-surface-soft/60 hover:text-text-primary',
              )}
            >
              {Icon && <Icon size={20} className="shrink-0" />}
              <span className="flex-1">{item.label}</span>
              {badgeValue !== undefined && badgeValue > 0 && (
                <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-accent text-white text-xs font-bold">
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/settings"
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-soft/60 hover:text-text-primary transition-colors duration-200 mb-4"
      >
        <Settings size={20} className="shrink-0" />
        <span>Settings</span>
      </Link>

      {/* School Profile */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-soft">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          DP
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">Delhi Public School</p>
          <p className="text-xs text-text-muted truncate">Bokaro Steel City</p>
        </div>
      </div>
    </aside>
  );
}
