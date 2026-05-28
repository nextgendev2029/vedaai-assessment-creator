import { cn } from '@/lib/cn';
import { Check, Loader2, Circle, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'queued', label: 'Queued' },
  { key: 'reading_material', label: 'Reading Material' },
  { key: 'building_prompt', label: 'Building Prompt' },
  { key: 'generating_questions', label: 'Generating Questions' },
  { key: 'validating_output', label: 'Validating Output' },
  { key: 'saving_result', label: 'Saving Result' },
  { key: 'completed', label: 'Completed' },
] as const;

interface GenerationStepTimelineProps {
  currentStep: string;
  isFailed: boolean;
  className?: string;
}

export function GenerationStepTimeline({ currentStep, isFailed, className }: GenerationStepTimelineProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn('space-y-0', className)}>
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex || (currentStep === 'completed' && i === currentIndex);
        const isCurrent = i === currentIndex && currentStep !== 'completed';
        const isPending = i > currentIndex;
        const isFailedStep = isFailed && isCurrent;

        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                isCompleted && 'bg-emerald-100',
                isCurrent && !isFailedStep && 'bg-blue-100',
                isFailedStep && 'bg-red-100',
                isPending && 'bg-gray-100',
              )}>
                {isCompleted && <Check size={14} className="text-emerald-600" />}
                {isCurrent && !isFailedStep && <Loader2 size={14} className="text-blue-600 animate-spin" />}
                {isFailedStep && <XCircle size={14} className="text-red-600" />}
                {isPending && <Circle size={14} className="text-gray-300" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'w-0.5 h-6',
                  isCompleted ? 'bg-emerald-300' : 'bg-gray-200',
                )} />
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'text-sm pt-1',
              isCompleted && 'text-emerald-700 font-medium',
              isCurrent && !isFailedStep && 'text-blue-700 font-semibold',
              isFailedStep && 'text-red-700 font-semibold',
              isPending && 'text-gray-400',
            )}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
