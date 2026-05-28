'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AssignmentCard } from './assignment-card';
import { SearchFilterBar } from './search-filter-bar';
import { EmptyAssignmentsState } from './empty-assignments-state';
import { AssignmentLoadingState } from './assignment-loading-state';
import { BackendErrorState } from './backend-error-state';
import { Plus, ArrowLeft } from 'lucide-react';
import { demoAssignments, type DisplayAssignment } from '@/lib/mock-data';
import {
  fetchAssignments,
  deleteAssignment as apiDeleteAssignment,
  type ApiAssignment,
} from '@/lib/api-client';

interface AssignmentsDashboardProps {
  mode: 'local' | 'demo' | 'empty';
}

/** Convert API assignment to card display format */
function apiToDisplay(a: ApiAssignment): DisplayAssignment {
  const created = new Date(a.createdAt);
  const assignedOn = [
    String(created.getDate()).padStart(2, '0'),
    String(created.getMonth() + 1).padStart(2, '0'),
    String(created.getFullYear()),
  ].join('-');

  // Format dueDate from ISO to DD-MM-YYYY
  let dueDate = a.dueDate;
  try {
    const d = new Date(a.dueDate);
    if (!isNaN(d.getTime())) {
      dueDate = [
        String(d.getDate()).padStart(2, '0'),
        String(d.getMonth() + 1).padStart(2, '0'),
        String(d.getFullYear()),
      ].join('-');
    }
  } catch {
    // keep original string
  }

  return {
    id: a.id,
    title: a.title,
    assignedOn,
    dueDate,
    status: a.status === 'draft' ? 'draft' : a.status === 'completed' ? 'completed' : 'active',
    isDemo: false,
  };
}

export function AssignmentsDashboard({ mode }: AssignmentsDashboardProps) {
  /* ─── API state ────────────────────────────────────────────────────────── */
  const [apiAssignments, setApiAssignments] = useState<DisplayAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(mode === 'local');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Fetch from API ───────────────────────────────────────────────────── */
  const loadAssignments = useCallback(
    async (search?: string) => {
      if (mode !== 'local') return;
      setIsLoading(true);
      setHasError(false);
      try {
        const result = await fetchAssignments({
          search: search || undefined,
          limit: 50,
        });
        setApiAssignments(result.items.map(apiToDisplay));
      } catch (err) {
        setHasError(true);
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to fetch assignments',
        );
        setApiAssignments([]);
      } finally {
        setIsLoading(false);
      }
    },
    [mode],
  );

  /* Initial load */
  useEffect(() => {
    if (mode === 'local') {
      loadAssignments();
    }
  }, [mode, loadAssignments]);

  /* ─── Debounced search ─────────────────────────────────────────────────── */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (mode !== 'local') return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        loadAssignments(value);
      }, 400);
    },
    [mode, loadAssignments],
  );

  /* ─── Display assignments ──────────────────────────────────────────────── */
  const displayAssignments: DisplayAssignment[] = useMemo(() => {
    if (mode === 'empty') return [];
    if (mode === 'demo') return demoAssignments;
    return apiAssignments;
  }, [mode, apiAssignments]);

  /* Local search filter for demo mode */
  const filteredAssignments = useMemo(() => {
    if (mode === 'local') return displayAssignments; // already filtered by API
    if (!searchQuery.trim()) return displayAssignments;
    const q = searchQuery.toLowerCase();
    return displayAssignments.filter((a) => a.title.toLowerCase().includes(q));
  }, [displayAssignments, searchQuery, mode]);

  const isEmpty =
    mode === 'empty' ||
    (mode === 'local' && !isLoading && !hasError && apiAssignments.length === 0);

  /* ─── Delete handler ───────────────────────────────────────────────────── */
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await apiDeleteAssignment(id);
        setApiAssignments((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Delete failed:', err);
      }
    },
    [],
  );

  /* ─── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="w-full max-w-[var(--mobile-content-max)] lg:max-w-[1100px] mx-auto">
      {/* Mobile page title row */}
      <div className="flex lg:hidden items-center gap-3 mt-4 mb-4">
        <button className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center cursor-pointer">
          <ArrowLeft size={20} className="text-text-primary" />
        </button>
        <h1 className="text-base font-bold text-text-primary">Assignments</h1>
      </div>

      {/* Desktop title section */}
      {!isEmpty && !isLoading && (
        <div className="hidden lg:block mt-6 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-success" />
            <h1 className="text-2xl font-bold text-text-primary">Assignments</h1>
          </div>
          <p className="mt-1 ml-[22px] text-sm text-text-muted">
            Manage and create assignments for your classes.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <AssignmentLoadingState className="mt-6" />}

      {/* Error state */}
      {!isLoading && hasError && (
        <BackendErrorState
          message={errorMessage}
          onRetry={() => loadAssignments(searchQuery)}
          className="mt-8 lg:mt-12"
        />
      )}

      {/* Empty state */}
      {isEmpty && <EmptyAssignmentsState className="mt-8 lg:mt-12" />}

      {/* Content */}
      {!isLoading && !hasError && !isEmpty && (
        <>
          {/* Filter / Search bar */}
          <SearchFilterBar
            className="mb-4 lg:mb-5"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {/* Cards grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
            {filteredAssignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                onDelete={a.isDemo ? undefined : handleDelete}
              />
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <p className="text-center text-sm text-text-muted py-12">
              No assignments match your search.
            </p>
          )}
        </>
      )}

      {/* Floating create button - mobile */}
      {!isEmpty && (
        <Link
          href="/assignments/create"
          className="fixed right-4 bottom-24 lg:hidden z-40"
        >
          <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center shadow-[var(--shadow-float)] cursor-pointer active:scale-95 transition-transform">
            <Plus size={24} className="text-accent" />
          </div>
        </Link>
      )}

      {/* Floating create button - desktop */}
      {!isEmpty && (
        <Link
          href="/assignments/create"
          className="hidden lg:flex fixed bottom-6 left-1/2 lg:left-[calc(var(--sidebar-width)+((100vw-var(--sidebar-width))/2))] -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-2.5 h-12 px-8 rounded-[48px] bg-primary text-white text-sm font-semibold shadow-[var(--shadow-realistic)] cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all duration-200">
            <Plus size={18} />
            Create Assignment
          </div>
        </Link>
      )}
    </div>
  );
}
