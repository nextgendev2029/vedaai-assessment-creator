'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { GenerationStatusPanel } from '@/components/assignments/generation-status-panel';
import { AssignmentLoadingState } from '@/components/assignments/assignment-loading-state';
import { BackendErrorState } from '@/components/assignments/backend-error-state';
import { useGenerationSocket } from '@/hooks/use-generation-socket';
import {
  fetchAssignmentById,
  getGenerationState,
  regenerateAssignment,
  type ApiAssignment,
  type GenerationJobState,
} from '@/lib/api-client';

export default function AssignmentStatusPage() {
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<ApiAssignment | null>(null);
  const [initialState, setInitialState] = useState<GenerationJobState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Socket hook for live updates
  const { state: socketState } = useGenerationSocket(assignmentId);

  // Merged state: socket takes priority over initial fetch
  const currentState = socketState ?? initialState;

  // Fetch initial data
  useEffect(() => {
    async function load() {
      try {
        const [assignmentData, stateData] = await Promise.all([
          fetchAssignmentById(assignmentId),
          getGenerationState(assignmentId),
        ]);
        setAssignment(assignmentData);
        setInitialState(stateData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [assignmentId]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    try {
      const result = await regenerateAssignment(assignmentId);
      setInitialState(result.state);
    } catch (err) {
      console.error('Retry failed:', err);
    }
  }, [assignmentId]);

  return (
    <AppShell>
      <div className="p-4 lg:p-8">
        {isLoading && <AssignmentLoadingState className="max-w-2xl mx-auto" />}
        {!isLoading && error && (
          <BackendErrorState message={error} onRetry={() => window.location.reload()} />
        )}
        {!isLoading && !error && assignment && (
          <GenerationStatusPanel
            assignmentId={assignmentId}
            assignmentTitle={assignment.title}
            state={currentState}
            onRetry={handleRetry}
          />
        )}
      </div>
    </AppShell>
  );
}
