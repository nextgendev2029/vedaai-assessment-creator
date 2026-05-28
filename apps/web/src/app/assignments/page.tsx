import { AppShell } from '@/components/layout/app-shell';
import { AssignmentsDashboard } from '@/components/assignments/assignments-dashboard';

interface AssignmentsPageProps {
  searchParams: Promise<{ state?: string; demo?: string }>;
}

/**
 * Assignments dashboard page.
 * - /assignments → shows local assignments from Zustand store
 * - /assignments?state=empty → shows empty state
 * - /assignments?demo=true → shows demo/mock cards
 * - /assignments?state=filled → alias for demo
 */
export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const params = await searchParams;

  let mode: 'local' | 'demo' | 'empty' = 'local';
  if (params.state === 'empty') {
    mode = 'empty';
  } else if (params.demo === 'true' || params.state === 'filled') {
    mode = 'demo';
  }

  return (
    <AppShell>
      <AssignmentsDashboard mode={mode} />
    </AppShell>
  );
}
