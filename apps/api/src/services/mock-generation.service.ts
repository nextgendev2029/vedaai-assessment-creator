import type { IAssignment } from '../models/assignment.model';
import type { GeneratedPaperData, GeneratedSection, GeneratedQuestion, AnswerKeyEntry } from '@vedaai/shared';

const SECTION_MAP: Record<string, { title: string; label: string }> = {
  mcq: { title: 'Section A', label: 'Multiple Choice Questions' },
  short_answer: { title: 'Section B', label: 'Short Answer Questions' },
  long_answer: { title: 'Section C', label: 'Long Answer Questions' },
  case_study: { title: 'Section D', label: 'Case Study Questions' },
};

const DIFFICULTIES: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

function generateMCQOptions(subject: string, qIndex: number): string[] {
  return [
    `Option A for ${subject} Q${qIndex + 1}`,
    `Option B for ${subject} Q${qIndex + 1}`,
    `Option C for ${subject} Q${qIndex + 1}`,
    `Option D for ${subject} Q${qIndex + 1}`,
  ];
}

function generateQuestionText(type: string, subject: string, topic: string, index: number): string {
  const templates: Record<string, string[]> = {
    mcq: [
      `Which of the following best describes the concept of ${topic} in ${subject}?`,
      `What is the primary characteristic of ${topic} as studied in ${subject}?`,
      `In the context of ${subject}, which statement about ${topic} is correct?`,
      `Which principle of ${topic} is most relevant to ${subject}?`,
      `Select the correct answer regarding ${topic} in ${subject}.`,
    ],
    short_answer: [
      `Define ${topic} as it relates to ${subject}. Provide a brief explanation.`,
      `Explain the significance of ${topic} in ${subject}.`,
      `List three key properties of ${topic} studied in ${subject}.`,
      `Differentiate between the main aspects of ${topic} in ${subject}.`,
      `Briefly describe how ${topic} is applied in ${subject}.`,
    ],
    long_answer: [
      `Discuss in detail the concept of ${topic} in ${subject}. Include examples.`,
      `Explain the theoretical framework of ${topic} in ${subject} with diagrams if needed.`,
      `Analyze the importance of ${topic} in modern ${subject}. Discuss with examples.`,
      `Compare and contrast different approaches to ${topic} in ${subject}.`,
      `Critically evaluate the role of ${topic} in ${subject} with real-world applications.`,
    ],
    case_study: [
      `A student observes phenomena related to ${topic} in a ${subject} lab. Based on the principles of ${topic}, analyze the observations and explain the underlying concepts.`,
      `A research team is investigating ${topic} in the field of ${subject}. Read the following scenario and answer the questions that follow about ${topic}.`,
      `Consider a real-world scenario involving ${topic} in ${subject}. Identify the key principles at work and propose solutions.`,
    ],
  };

  const pool = templates[type] || templates.short_answer;
  return pool[index % pool.length];
}

function generateAnswer(type: string, index: number): string {
  if (type === 'mcq') {
    const options = ['A', 'B', 'C', 'D'];
    return `Option ${options[index % 4]}`;
  }
  if (type === 'short_answer') {
    return `This is a model short answer for question ${index + 1}. The key concepts involve the fundamental principles and their applications.`;
  }
  if (type === 'long_answer') {
    return `This is a detailed model answer for question ${index + 1}. It covers the theoretical background, practical applications, and critical analysis of the topic with relevant examples.`;
  }
  return `This is a comprehensive case study answer for question ${index + 1}. It includes analysis of the scenario, identification of key principles, and proposed solutions.`;
}

export function generateMockPaper(assignment: IAssignment): GeneratedPaperData {
  const sections: GeneratedSection[] = [];
  const answerKey: AnswerKeyEntry[] = [];
  let globalQuestionIndex = 0;

  for (const config of assignment.questionConfigs) {
    const sectionInfo = SECTION_MAP[config.type] || { title: 'Section', label: config.type };
    const questions: GeneratedQuestion[] = [];

    for (let i = 0; i < config.count; i++) {
      const qId = `q-${globalQuestionIndex + 1}`;
      const difficulty = DIFFICULTIES[i % DIFFICULTIES.length];

      const question: GeneratedQuestion = {
        id: qId,
        text: generateQuestionText(config.type, assignment.subject, assignment.topic, i),
        type: config.type,
        difficulty,
        marks: config.marks,
        ...(config.type === 'mcq' ? { options: generateMCQOptions(assignment.subject, i) } : {}),
      };

      questions.push(question);
      answerKey.push({
        questionId: qId,
        answer: generateAnswer(config.type, i),
      });

      globalQuestionIndex++;
    }

    sections.push({
      title: `${sectionInfo.title}: ${sectionInfo.label}`,
      questionType: config.type,
      instruction: `Attempt all questions. Each question carries ${config.marks} mark${config.marks > 1 ? 's' : ''}.`,
      questions,
    });
  }

  return {
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    subject: assignment.subject,
    className: assignment.className,
    topic: assignment.topic,
    durationMinutes: assignment.durationMinutes || 60,
    maxMarks: assignment.totalMarks,
    instructions: 'Answer all questions. Read each question carefully before answering.',
    sections,
    answerKey,
    generatedBy: 'mock',
  };
}
