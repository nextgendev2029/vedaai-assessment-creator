'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { OutputActionBanner } from '@/components/assignments/output/output-action-banner';
import { GeneratedByBadge } from '@/components/assignments/output/generated-by-badge';
import { ExamPaper } from '@/components/assignments/output/exam-paper';
import { PaperEmptyState } from '@/components/assignments/output/paper-empty-state';
import { PaperLoadingState } from '@/components/assignments/output/paper-loading-state';
import { BackendErrorState } from '@/components/assignments/backend-error-state';
import {
  fetchAssignmentById,
  getGeneratedPaper,
  regenerateAssignment,
  type ApiAssignment,
  type GeneratedPaperResponse,
} from '@/lib/api-client';
import { BookOpen, Clock, Award, Hash } from 'lucide-react';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<ApiAssignment | null>(null);
  const [paper, setPaper] = useState<GeneratedPaperResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [assignmentData, paperData] = await Promise.all([
          fetchAssignmentById(assignmentId),
          getGeneratedPaper(assignmentId),
        ]);
        setAssignment(assignmentData);
        setPaper(paperData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [assignmentId]);

  const handleRegenerate = useCallback(async () => {
    await regenerateAssignment(assignmentId);
    router.push(`/assignments/${assignmentId}/status`);
  }, [assignmentId, router]);

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell>
        <div className="p-4 lg:p-6">
          <PaperLoadingState />
        </div>
      </AppShell>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppShell>
        <div className="p-4 lg:p-6">
          <BackendErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      </AppShell>
    );
  }

  // ── No paper yet ───────────────────────────────────────────────────────
  if (!paper) {
    return (
      <AppShell>
        <div className="p-4 lg:p-6">
          <PaperEmptyState assignmentId={assignmentId} />
        </div>
      </AppShell>
    );
  }

  // ── Compute stats ──────────────────────────────────────────────────────
  const totalQuestions = paper.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalSections = paper.sections.length;

  // ── Main output ────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="p-3 lg:p-6 pb-28 lg:pb-6">
        {/* Dark wrapper matching Figma #5E5E5E */}
        <div className="max-w-[980px] mx-auto bg-[#5E5E5E] rounded-[32px] p-3 lg:p-5">

          {/* ─── Action Banner ────────────────────────────────────────── */}
          <OutputActionBanner
            assignmentId={assignmentId}
            className_={paper.className}
            subject={paper.subject}
            topic={paper.topic}
            onRegenerate={handleRegenerate}
          />

          {/* ─── Meta row: badge + stats ──────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-4 px-1">
            <GeneratedByBadge
              generatedBy={paper.generatedBy}
              model={paper.aiMetadata?.model}
              fallbackUsed={paper.aiMetadata?.fallbackUsed}
            />
            <div className="flex items-center gap-3 text-[11px] text-white/40">
              <span className="inline-flex items-center gap-1">
                <BookOpen size={11} /> {totalSections} sections
              </span>
              <span className="inline-flex items-center gap-1">
                <Hash size={11} /> {totalQuestions} questions
              </span>
              <span className="inline-flex items-center gap-1">
                <Award size={11} /> {paper.maxMarks} marks
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {paper.durationMinutes} min
              </span>
            </div>
          </div>

          {/* ─── White Paper Sheet ─────────────────────────────────────── */}
          <ExamPaper paper={paper} />

        </div>
      </div>
    </AppShell>
  );
}
