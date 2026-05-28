import { QuestionItem } from './question-item';

interface PaperSectionProps {
  title: string;
  instruction: string;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    difficulty: string;
    marks: number;
    options?: string[];
  }>;
  startNumber: number;
}

export function PaperSection({ title, instruction, questions, startNumber }: PaperSectionProps) {
  return (
    <div className="py-5 first:pt-0">
      {/* Section heading */}
      <div className="text-center mb-1">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 italic text-center mb-4">{instruction}</p>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-2" />

      {/* Questions */}
      <div className="space-y-1">
        {questions.map((q, idx) => (
          <QuestionItem
            key={q.id}
            number={startNumber + idx}
            text={q.text}
            type={q.type}
            difficulty={q.difficulty}
            marks={q.marks}
            options={q.options}
          />
        ))}
      </div>
    </div>
  );
}
