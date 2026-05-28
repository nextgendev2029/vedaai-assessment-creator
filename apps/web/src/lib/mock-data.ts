/** Shape used by the dashboard card (works for both demo and local assignments). */
export interface DisplayAssignment {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed' | 'active';
  /** true for demo/mock cards (disable delete) */
  isDemo?: boolean;
}

/**
 * Demo assignment data matching the Figma design.
 * Available via /assignments?demo=true for Phase 2 compatibility.
 */
export const demoAssignments: DisplayAssignment[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `demo-${i + 1}`,
    title: 'Quiz on Electricity',
    assignedOn: '20-06-2025',
    dueDate: '21-06-2025',
    status: 'active' as const,
    isDemo: true,
  }),
);

/** @deprecated Use demoAssignments instead */
export const mockAssignments = demoAssignments;

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export const sidebarNavItems: NavItem[] = [
  { label: 'Home', icon: 'Grid2x2', href: '/' },
  { label: 'My Groups', icon: 'Users', href: '/groups' },
  { label: 'Assignments', icon: 'ClipboardList', href: '/assignments', badge: 10 },
  { label: "AI Teacher's Toolkit", icon: 'Sparkles', href: '/toolkit' },
  { label: 'My Library', icon: 'BookOpen', href: '/library' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Home', icon: 'Grid2x2', href: '/' },
  { label: 'Assignments', icon: 'ClipboardList', href: '/assignments' },
  { label: 'Library', icon: 'BookOpen', href: '/library' },
  { label: 'AI Toolkit', icon: 'Sparkles', href: '/toolkit' },
];

/** Question type labels for the create form */
export const questionTypeLabels: Record<string, string> = {
  mcq: 'Multiple Choice Questions',
  short_answer: 'Short Questions',
  long_answer: 'Long Questions',
  case_study: 'Case Study Questions',
};
