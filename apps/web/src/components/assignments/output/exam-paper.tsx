import { StudentInfoSection } from './student-info-section';
import { PaperSection } from './paper-section';
import { AnswerKeySection } from './answer-key-section';
import type { GeneratedPaperResponse } from '@/lib/api-client';

interface ExamPaperProps {
  paper: GeneratedPaperResponse;
}

export function ExamPaper({ paper }: ExamPaperProps) {
  // Calculate running question numbers across sections
  let questionCounter = 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* ─── Paper Header ─────────────────────────────────────────────────── */}
      <div className="text-center px-6 lg:px-10 pt-8 pb-5 border-b border-gray-200">
        <p className="text-base lg:text-lg font-bold text-gray-900 tracking-tight">
          {paper.schoolName || 'Delhi Public School, Sector-4, Bokaro'}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{paper.subject}</span>
          <span className="text-gray-300">·</span>
          <span>{paper.className}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Topic: {paper.topic}</p>
      </div>

      {/* ─── Time / Marks Row ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-3 border-b border-gray-200 text-sm">
        <span className="text-gray-600">
          Time Allowed: <span className="font-semibold text-gray-800">{paper.durationMinutes} min</span>
        </span>
        <span className="text-gray-600">
          Maximum Marks: <span className="font-semibold text-gray-800">{paper.maxMarks}</span>
        </span>
      </div>

      {/* ─── General Instructions ─────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 py-3 border-b border-gray-200 bg-gray-50/60">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
          General Instructions
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {paper.instructions || 'All questions are compulsory unless stated otherwise.'}
        </p>
      </div>

      {/* ─── Student Info ─────────────────────────────────────────────────── */}
      <StudentInfoSection className_={paper.className} />

      {/* ─── Sections ─────────────────────────────────────────────────────── */}
      <div className="px-6 lg:px-10 py-4 divide-y divide-gray-100">
        {paper.sections.map((section, sIdx) => {
          const startNum = questionCounter + 1;
          questionCounter += section.questions.length;

          return (
            <PaperSection
              key={sIdx}
              title={section.title}
              instruction={section.instruction}
              questions={section.questions}
              startNumber={startNum}
            />
          );
        })}
      </div>

      {/* ─── End of Paper ─────────────────────────────────────────────────── */}
      <div className="text-center py-4 border-t border-gray-200">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          — End of Question Paper —
        </p>
      </div>

      {/* ─── Answer Key ───────────────────────────────────────────────────── */}
      <AnswerKeySection answerKey={paper.answerKey} />
    </div>
  );
}
