'use client';

import { cn } from '@/lib/cn';
import { Grid2x2, ClipboardList, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType } from 'react';

interface BottomNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const items: BottomNavItem[] = [
  { label: 'Home', href: '/', icon: Grid2x2 },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'AI Toolkit', href: '/toolkit', icon: Sparkles },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 lg:hidden z-50 w-[calc(100vw-20px)] max-w-[var(--mobile-content-max)]">
      <div className="flex items-center justify-around bg-primary rounded-3xl h-[72px] px-4 shadow-[var(--shadow-realistic)]">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-colors duration-200',
                isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
