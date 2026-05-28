import { cn } from '@/lib/cn';
import { Sparkles, Cpu, AlertTriangle, Zap } from 'lucide-react';

interface GeneratedByBadgeProps {
  generatedBy: string;
  model?: string;
  fallbackUsed?: boolean;
  className?: string;
}

export function GeneratedByBadge({ generatedBy, model, fallbackUsed, className }: GeneratedByBadgeProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Provider badge */}
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide',
          generatedBy === 'gemini' && 'bg-blue-50 text-blue-700',
          generatedBy === 'groq' && 'bg-orange-50 text-orange-700',
          generatedBy === 'groq_fallback' && 'bg-amber-50 text-amber-700',
          generatedBy === 'mock_fallback' && 'bg-amber-50 text-amber-700',
          generatedBy === 'mock' && 'bg-gray-100 text-gray-500',
        )}
      >
        {generatedBy === 'gemini' ? (
          <><Sparkles size={11} /> Gemini</>
        ) : generatedBy === 'groq' ? (
          <><Zap size={11} /> Groq</>
        ) : generatedBy === 'groq_fallback' ? (
          <><Zap size={11} /> Groq fallback</>
        ) : generatedBy === 'mock_fallback' ? (
          <><Cpu size={11} /> Mock fallback</>
        ) : (
          <><Cpu size={11} /> Mock</>
        )}
        {model && <span className="text-[10px] font-normal opacity-70">· {model}</span>}
      </span>

      {/* Fallback warning */}
      {fallbackUsed && (
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
          <AlertTriangle size={10} />
          AI unavailable, used fallback
        </span>
      )}
    </div>
  );
}
