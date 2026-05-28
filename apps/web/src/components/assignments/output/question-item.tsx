import { cn } from '@/lib/cn';

const DIFFICULTY_DISPLAY: Record<string, string> = {
  easy: 'Easy',
  medium: 'Moderate',
  hard: 'Hard',
};

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700',
  medium: 'bg-amber-50 text-amber-700',
  hard: 'bg-red-50 text-red-700',
};

interface QuestionItemProps {
  number: number;
  text: string;
  type: string;
  difficulty: string;
  marks: number;
  options?: string[];
}

export function QuestionItem({ number, text, type, difficulty, marks, options }: QuestionItemProps) {
  return (
    <div className="flex gap-2 lg:gap-3 py-2.5">
      {/* Number */}
      <span className="text-sm font-bold text-gray-800 shrink-0 w-7 text-right pt-0.5">
        {number}.
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Question text + meta */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-800 leading-relaxed break-words overflow-wrap-anywhere flex-1">
            {text}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            <span
              className={cn(
                'text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                DIFFICULTY_STYLE[difficulty] || DIFFICULTY_STYLE.medium,
              )}
            >
              {DIFFICULTY_DISPLAY[difficulty] || difficulty}
            </span>
            <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
              [{marks} {marks === 1 ? 'Mark' : 'Marks'}]
            </span>
          </div>
        </div>

        {/* MCQ options */}
        {type === 'mcq' && options && options.length > 0 && (
          <div className="mt-2 ml-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            {options.map((opt, idx) => (
              <p key={idx} className="text-sm text-gray-600 leading-relaxed">
                <span className="font-medium text-gray-700">({String.fromCharCode(65 + idx)})</span>{' '}
                {opt}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
