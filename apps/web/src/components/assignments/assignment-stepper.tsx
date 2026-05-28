import { cn } from '@/lib/cn';

interface AssignmentStepperProps {
  currentStep: 1 | 2;
  className?: string;
}

export function AssignmentStepper({ currentStep, className }: AssignmentStepperProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 h-1.5 rounded-full transition-colors duration-300',
          currentStep >= 1 ? 'bg-primary' : 'bg-black/10',
        )}
      />
      <div
        className={cn(
          'flex-1 h-1.5 rounded-full transition-colors duration-300',
          currentStep >= 2 ? 'bg-primary' : 'bg-black/10',
        )}
      />
    </div>
  );
}
