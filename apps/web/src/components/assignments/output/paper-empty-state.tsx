import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaperEmptyStateProps {
  assignmentId: string;
}

export function PaperEmptyState({ assignmentId }: PaperEmptyStateProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <FileText size={28} className="text-gray-400" />
      </div>
      <h2 className="text-lg font-bold text-text-primary">Paper Not Ready Yet</h2>
      <p className="text-sm text-text-muted mt-2 max-w-xs mx-auto">
        The generated paper is not available yet. Check the generation progress or go back to assignments.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <Link href={`/assignments/${assignmentId}/status`}>
          <Button variant="primary" size="sm" className="rounded-full px-6">
            View Generation Progress
          </Button>
        </Link>
        <Link href="/assignments">
          <Button variant="outline" size="sm" className="rounded-full px-6" icon={<ArrowLeft size={14} />}>
            Back to Assignments
          </Button>
        </Link>
      </div>
    </div>
  );
}
