import { cn } from '@/lib/cn';
import { EmptyAssignmentsIllustration } from '@/components/illustrations/empty-assignments-illustration';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyAssignmentsStateProps {
  className?: string;
}

export function EmptyAssignmentsState({ className }: EmptyAssignmentsStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 lg:py-24 px-6', className)}>
      <EmptyAssignmentsIllustration />

      <h2 className="mt-8 text-xl lg:text-2xl font-bold text-text-primary text-center">
        No assignments yet
      </h2>

      <p className="mt-3 text-sm lg:text-base text-text-muted text-center max-w-md leading-relaxed">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Link href="/assignments/create">
        <Button
          variant="primary"
          size="lg"
          className="mt-8 rounded-xl"
          icon={<Plus size={18} />}
        >
          Create Your First Assignment
        </Button>
      </Link>
    </div>
  );
}
