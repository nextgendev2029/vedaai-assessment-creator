import type { IAssignment } from '../../models/assignment.model';

const MAX_SOURCE_MATERIAL_CHARS = 12_000;

const QUESTION_TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice Questions (MCQ) — provide exactly 4 options labeled A, B, C, D',
  short_answer: 'Short Answer Questions — 2-4 sentences each',
  long_answer: 'Long Answer / Essay Questions — detailed answers required',
  case_study: 'Case Study Based Questions — provide a scenario and questions',
};

/**
 * Build a structured prompt for Gemini to generate a question paper.
 */
export function buildAssessmentPrompt(assignment: IAssignment): string {
  const lines: string[] = [];

  lines.push('You are an expert teacher and assessment designer.');
  lines.push('Generate a structured exam-ready question paper in JSON format.');
  lines.push('');
  lines.push('## Paper Details');
  lines.push(`- Title: ${assignment.title}`);
  lines.push(`- Subject: ${assignment.subject}`);
  lines.push(`- Class / Grade: ${assignment.className}`);
  lines.push(`- Topic / Chapter: ${assignment.topic}`);
  lines.push(`- Duration: ${assignment.durationMinutes || 60} minutes`);
  lines.push(`- Total Questions: ${assignment.totalQuestions}`);
  lines.push(`- Total Marks: ${assignment.totalMarks}`);
  lines.push('');

  // Question configurations
  lines.push('## Question Configuration');
  for (const config of assignment.questionConfigs) {
    const label = QUESTION_TYPE_LABELS[config.type] || config.type;
    lines.push(
      `- ${config.count} × ${label}, each worth ${config.marks} mark${config.marks > 1 ? 's' : ''}`,
    );
  }
  lines.push('');

  // Difficulty distribution
  lines.push('## Difficulty Distribution');
  lines.push('- Mix difficulties: easy, medium, hard');
  lines.push('- For each question type, cycle through: easy → medium → hard');
  lines.push('- Use ONLY these exact values for difficulty: "easy", "medium", "hard"');
  lines.push('');

  // Additional instructions
  if (assignment.instructions) {
    lines.push('## Additional Instructions from Teacher');
    lines.push(assignment.instructions);
    lines.push('');
  }

  // Source material
  if (assignment.sourceMaterial?.extractedText) {
    let material = assignment.sourceMaterial.extractedText;
    if (material.length > MAX_SOURCE_MATERIAL_CHARS) {
      material = material.substring(0, MAX_SOURCE_MATERIAL_CHARS) + '\n... [truncated]';
    }
    lines.push('## Source Material (base questions on this content)');
    lines.push(material);
    lines.push('');
  }

  // Output format requirements
  lines.push('## Output Requirements');
  lines.push('Return ONLY a valid JSON object with this exact structure:');
  lines.push('```json');
  lines.push('{');
  lines.push('  "schoolName": "Delhi Public School, Bokaro",');
  lines.push(`  "subject": "${assignment.subject}",`);
  lines.push(`  "className": "${assignment.className}",`);
  lines.push(`  "topic": "${assignment.topic}",`);
  lines.push(`  "durationMinutes": ${assignment.durationMinutes || 60},`);
  lines.push(`  "maxMarks": ${assignment.totalMarks},`);
  lines.push('  "instructions": "General instructions for students",');
  lines.push('  "sections": [');
  lines.push('    {');
  lines.push('      "title": "Section A: Multiple Choice Questions",');
  lines.push('      "questionType": "mcq",');
  lines.push('      "instruction": "Choose the correct option.",');
  lines.push('      "questions": [');
  lines.push('        {');
  lines.push('          "id": "q-1",');
  lines.push('          "text": "Question text here",');
  lines.push('          "type": "mcq",');
  lines.push('          "difficulty": "easy",');
  lines.push('          "marks": 1,');
  lines.push('          "options": ["First option content", "Second option content", "Third option content", "Fourth option content"]');
  lines.push('        }');
  lines.push('      ]');
  lines.push('    }');
  lines.push('  ],');
  lines.push('  "answerKey": [');
  lines.push('    { "questionId": "q-1", "answer": "Correct answer text" }');
  lines.push('  ]');
  lines.push('}');
  lines.push('```');
  lines.push('');
  lines.push('## Critical Rules');
  lines.push(`1. Total marks MUST equal exactly ${assignment.totalMarks}.`);
  lines.push('2. Each question MUST have a unique "id" (e.g., "q-1", "q-2", ...).');
  lines.push('3. Each question type MUST match its section "questionType".');
  lines.push('4. MCQ questions MUST have exactly 4 options. Options MUST be plain text only. Do NOT prefix option text with labels like "(A)", "A.", "Option A:", or similar (the frontend automatically adds "(A)", "(B)", etc.).');
  lines.push('5. Every question MUST appear in the answerKey.');
  lines.push('6. Use ONLY "easy", "medium", "hard" for difficulty.');
  lines.push('7. Do NOT include markdown, explanations, or any text outside the JSON.');
  lines.push('8. Make questions academically rigorous and relevant to the topic.');
  lines.push('9. Vary question styles — avoid repetitive phrasing.');
  lines.push('10. Return ONLY the JSON object, no wrapping text.');

  return lines.join('\n');
}

/**
 * Build a prompt hash for caching.
 * Deterministic based on assignment fields + model.
 */
export function buildPromptHash(assignment: IAssignment, model: string): string {
  const parts = [
    assignment.subject,
    assignment.className,
    assignment.topic,
    String(assignment.totalMarks),
    String(assignment.totalQuestions),
    JSON.stringify(assignment.questionConfigs),
    assignment.instructions || '',
    assignment.sourceMaterial?.extractedText?.substring(0, 500) || '',
    model,
  ].join('|');

  // Simple hash (djb2)
  let hash = 5381;
  for (let i = 0; i < parts.length; i++) {
    hash = ((hash << 5) + hash + parts.charCodeAt(i)) | 0;
  }
  return `ph-${Math.abs(hash).toString(36)}`;
}
