import { cn } from '@/lib/cn';

interface ReviewBreakdown {
  label: string;
  count: number;
  marks: number;
}

interface CreateAssignmentReviewProps {
  title: string;
  subject: string;
  classLevel: string;
  topic: string;
  dueDate: string;
  totalQuestions: number;
  totalMarks: number;
  questionBreakdown: ReviewBreakdown[];
  fileName?: string;
  className?: string;
}

export function CreateAssignmentReview({
  title,
  subject,
  classLevel,
  topic,
  dueDate,
  totalQuestions,
  totalMarks,
  questionBreakdown,
  fileName,
  className,
}: CreateAssignmentReviewProps) {
  return (
    <div className={cn('bg-surface rounded-3xl p-5 lg:p-6 shadow-[var(--shadow-card)]', className)}>
      <h3 className="text-lg font-bold text-text-primary mb-4">Review</h3>

      <div className="space-y-3">
        <ReviewRow label="Title" value={title || '\u2014'} />
        <ReviewRow label="Subject" value={subject || '\u2014'} />
        <ReviewRow label="Class" value={classLevel || '\u2014'} />
        <ReviewRow label="Topic" value={topic || '\u2014'} />
        <ReviewRow label="Due Date" value={dueDate || '\u2014'} />
        {fileName && <ReviewRow label="File" value={fileName} />}
      </div>

      {questionBreakdown.length > 0 && (
        <div className="mt-5 pt-4 border-t border-black/10">
          <p className="text-sm font-semibold text-text-primary mb-3">Question Breakdown</p>
          <div className="space-y-2">
            {questionBreakdown.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{q.label}</span>
                <span className="text-text-primary font-medium">
                  {q.count} &times; {q.marks} marks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-black/10 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Total Questions</span>
          <span className="font-bold text-text-primary">{totalQuestions}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Total Marks</span>
          <span className="font-bold text-text-primary">{totalMarks}</span>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-text-muted shrink-0">{label}</span>
      <span className="text-text-primary font-medium text-right">{value}</span>
    </div>
  );
}
