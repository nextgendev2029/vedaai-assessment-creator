'use client';

import { cn } from '@/lib/cn';
import Link from 'next/link';
import { ArrowLeft, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenerationStepTimeline } from './generation-step-timeline';
import type { GenerationJobState } from '@/lib/api-client';

interface GenerationStatusPanelProps {
  assignmentId: string;
  assignmentTitle: string;
  state: GenerationJobState | null;
  onRetry?: () => void;
  className?: string;
}

export function GenerationStatusPanel({
  assignmentId,
  assignmentTitle,
  state,
  onRetry,
  className,
}: GenerationStatusPanelProps) {
  const isCompleted = state?.status === 'completed';
  const isFailed = state?.status === 'failed';
  const progress = state?.progress ?? 0;

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Back link */}
      <Link
        href="/assignments"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Assignments
      </Link>

      {/* Main card */}
      <div className="bg-surface-panel rounded-[32px] p-6 lg:p-10">
        <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
          {isCompleted ? '🎉 Generation Complete!' : isFailed ? '⚠️ Generation Failed' : '✨ Generating Paper...'}
        </h1>
        <p className="text-sm text-text-muted mt-1">{assignmentTitle}</p>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">
              {state?.message || 'Waiting...'}
            </span>
            <span className="text-sm font-bold text-text-primary">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                isFailed ? 'bg-red-500' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step timeline */}
        <GenerationStepTimeline
          currentStep={state?.currentStep ?? 'queued'}
          isFailed={isFailed}
          className="mt-8"
        />

        {/* Error message */}
        {isFailed && state?.error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-100">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {isCompleted && (
            <Link href={`/assignments/${assignmentId}`}>
              <Button variant="primary" className="rounded-full px-6" icon={<Eye size={16} />}>
                View Generated Paper
              </Button>
            </Link>
          )}
          {isFailed && onRetry && (
            <Button
              variant="primary"
              className="rounded-full px-6"
              icon={<RefreshCw size={16} />}
              onClick={onRetry}
            >
              Retry Generation
            </Button>
          )}
          <Link href="/assignments">
            <Button variant="outline" className="rounded-full px-6">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
