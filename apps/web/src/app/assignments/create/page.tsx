import { AppShell } from '@/components/layout/app-shell';
import { CreateAssignmentForm } from '@/components/assignments/create-assignment-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateAssignmentPage() {
  return (
    <AppShell>
      <div className="w-full max-w-[var(--mobile-content-max)] lg:max-w-[1100px] mx-auto">
        {/* Mobile page title row */}
        <div className="flex lg:hidden items-center gap-3 mt-4 mb-4">
          <Link href="/assignments">
            <div className="h-12 w-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center cursor-pointer">
              <ArrowLeft size={20} className="text-text-primary" />
            </div>
          </Link>
          <h1 className="text-base font-bold text-text-primary">Create Assignment</h1>
        </div>

        {/* Desktop title section */}
        <div className="hidden lg:block mt-6 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-success" />
            <h1 className="text-2xl font-bold text-text-primary">Create Assignment</h1>
          </div>
          <p className="mt-1 ml-[22px] text-sm text-text-muted">
            Set up a new assignment for your students
          </p>
        </div>

        <CreateAssignmentForm />
      </div>
    </AppShell>
  );
}
