'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionType } from '@vedaai/shared';

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface LocalQuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface LocalAssignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  topic: string;
  dueDate: string;
  durationMinutes?: number;
  instructions?: string;
  fileName?: string;
  questionConfigs: LocalQuestionConfig[];
  totalQuestions: number;
  totalMarks: number;
  status: 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  className: string;
  topic: string;
  dueDate: string;
  durationMinutes?: number;
  instructions?: string;
  fileName?: string;
  questionConfigs: LocalQuestionConfig[];
}

/* ─── Store Interface ────────────────────────────────────────────────────── */

interface AssignmentStore {
  assignments: LocalAssignment[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  createAssignment: (input: CreateAssignmentInput) => string;
  deleteAssignment: (id: string) => void;
  updateAssignment: (id: string, patch: Partial<Omit<LocalAssignment, 'id' | 'createdAt'>>) => void;
  clearAssignments: () => void;
  getAssignmentById: (id: string) => LocalAssignment | undefined;
}

/* ─── UUID helper ────────────────────────────────────────────────────────── */

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ─── Store ──────────────────────────────────────────────────────────────── */

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set, get) => ({
      assignments: [],
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      createAssignment: (input) => {
        const now = new Date().toISOString();
        const totalQuestions = input.questionConfigs.reduce((sum, q) => sum + q.count, 0);
        const totalMarks = input.questionConfigs.reduce(
          (sum, q) => sum + q.count * q.marks,
          0,
        );

        const newAssignment: LocalAssignment = {
          id: generateId(),
          title: input.title,
          subject: input.subject,
          className: input.className,
          topic: input.topic,
          dueDate: input.dueDate,
          durationMinutes: input.durationMinutes,
          instructions: input.instructions,
          fileName: input.fileName,
          questionConfigs: input.questionConfigs,
          totalQuestions,
          totalMarks,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          assignments: [newAssignment, ...state.assignments],
        }));

        return newAssignment.id;
      },

      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      updateAssignment: (id, patch) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a,
          ),
        })),

      clearAssignments: () => set({ assignments: [] }),

      getAssignmentById: (id) => get().assignments.find((a) => a.id === id),
    }),
    {
      name: 'vedaai-assignments',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
