'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { MoreVertical } from 'lucide-react';
import { StatusBadge } from './status-badge';
import type { DisplayAssignment } from '@/lib/mock-data';
import { generateAssignment, regenerateAssignment } from '@/lib/api-client';

interface AssignmentCardProps {
  assignment: DisplayAssignment;
  onDelete?: (id: string) => void;
  className?: string;
}

export function AssignmentCard({ assignment, onDelete, className }: AssignmentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleAction = async (action: string) => {
    setMenuOpen(false);
    if (action === 'view') {
      router.push(`/assignments/${assignment.id}`);
    } else if (action === 'status') {
      router.push(`/assignments/${assignment.id}/status`);
    } else if (action === 'generate') {
      try {
        await generateAssignment(assignment.id);
        router.push(`/assignments/${assignment.id}/status`);
      } catch (err) {
        console.error('Generate failed:', err);
      }
    } else if (action === 'regenerate') {
      try {
        await regenerateAssignment(assignment.id);
        router.push(`/assignments/${assignment.id}/status`);
      } catch (err) {
        console.error('Regenerate failed:', err);
      }
    } else if (action === 'delete' && onDelete) {
      onDelete(assignment.id);
    }
  };

  const status = assignment.status;

  return (
    <div
      className={cn(
        'relative bg-surface-card lg:bg-surface rounded-3xl p-5 lg:p-6',
        'h-[128px] lg:h-[170px]',
        'flex flex-col justify-between',
        'transition-shadow duration-200 hover:shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Top row: title + badge + menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg lg:text-2xl font-extrabold text-text-primary leading-[120%] line-clamp-2">
            {assignment.title}
          </h3>
          {!assignment.isDemo && (
            <StatusBadge status={status} className="mt-1.5" />
          )}
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Assignment options"
          >
            <MoreVertical size={20} className="text-text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-surface rounded-xl shadow-lg border border-black/10 py-1 min-w-[180px] z-10">
              {/* Context-sensitive actions */}
              {!assignment.isDemo && status === 'draft' && (
                <button onClick={() => handleAction('generate')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                  Generate Paper
                </button>
              )}
              {!assignment.isDemo && (status === 'queued' || status === 'processing') && (
                <button onClick={() => handleAction('status')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                  View Progress
                </button>
              )}
              {!assignment.isDemo && status === 'completed' && (
                <>
                  <button onClick={() => handleAction('view')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                    View Assignment
                  </button>
                  <button onClick={() => handleAction('regenerate')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                    Regenerate
                  </button>
                </>
              )}
              {!assignment.isDemo && status === 'failed' && (
                <button onClick={() => handleAction('generate')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                  Retry Generation
                </button>
              )}
              {assignment.isDemo && (
                <button onClick={() => handleAction('view')} className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-soft transition-colors cursor-pointer">
                  View Assignment
                </button>
              )}
              {!assignment.isDemo && onDelete && (
                <button
                  onClick={() => handleAction('delete')}
                  className="w-full text-left px-4 py-2.5 text-sm text-accent hover:bg-surface-soft transition-colors cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: dates */}
      <div className="flex items-center gap-4 lg:gap-6 text-sm lg:text-base">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-accent">Assigned on</span>
          <span className="font-extrabold text-accent">:</span>
          <span className="text-text-muted font-medium">{assignment.assignedOn}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-text-primary">Due</span>
          <span className="font-extrabold text-text-primary">:</span>
          <span className="text-text-muted font-medium">{assignment.dueDate}</span>
        </div>
      </div>
    </div>
  );
}
