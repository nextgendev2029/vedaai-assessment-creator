'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnswerKeySectionProps {
  answerKey: Array<{
    questionId: string;
    answer: string;
  }>;
}

export function AnswerKeySection({ answerKey }: AnswerKeySectionProps) {
  const [visible, setVisible] = useState(true);

  if (answerKey.length === 0) return null;

  return (
    <div className="border-t-2 border-dashed border-gray-200 mt-2">
      {/* Toggle */}
      <button
        onClick={() => setVisible(!visible)}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        {visible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {visible ? 'Hide Answer Key' : 'Show Answer Key'}
      </button>

      {visible && (
        <div className="px-6 lg:px-10 pb-6">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 text-center">
            Answer Key
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {answerKey.map((entry) => (
              <div key={entry.questionId} className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 shrink-0">{entry.questionId}.</span>
                <span className="text-gray-600 break-words overflow-wrap-anywhere">{entry.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
