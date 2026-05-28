'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { questionTypeLabels } from '@/lib/mock-data';
import { createAssignment, generateAssignment, ApiClientError } from '@/lib/api-client';
import { FormField } from './form-field';
import { FileUploadZone } from './file-upload-zone';
import { QuestionTypeCard } from './question-type-card';
import { AssignmentStepper } from './assignment-stepper';
import { CreateAssignmentReview } from './create-assignment-review';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Plus, Loader2 } from 'lucide-react';
import type { QuestionType } from '@vedaai/shared';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface QuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const allQuestionTypes: QuestionType[] = ['mcq', 'short_answer', 'long_answer', 'case_study'];

const defaultConfigs: QuestionConfig[] = [
  { type: 'mcq', count: 4, marks: 1 },
  { type: 'short_answer', count: 4, marks: 2 },
];

const INPUT_CLASS =
  'w-full h-11 rounded-full border border-[#DADADA] px-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary transition-colors bg-transparent';

/* ─── Component ──────────────────────────────────────────────────────────── */

export function CreateAssignmentForm() {
  const router = useRouter();

  /* Form state */
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className_, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionConfigs, setQuestionConfigs] = useState<QuestionConfig[]>(defaultConfigs);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /* Computed */
  const totalQuestions = useMemo(
    () => questionConfigs.reduce((s, q) => s + q.count, 0),
    [questionConfigs],
  );
  const totalMarks = useMemo(
    () => questionConfigs.reduce((s, q) => s + q.count * q.marks, 0),
    [questionConfigs],
  );
  const availableTypes = useMemo(
    () => allQuestionTypes.filter((t) => !questionConfigs.some((q) => q.type === t)),
    [questionConfigs],
  );

  /* Format date for display (input type=date gives YYYY-MM-DD, we want DD-MM-YYYY) */
  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  }

  /* Question config actions */
  function addQuestionType() {
    if (availableTypes.length === 0) return;
    setQuestionConfigs((prev) => [
      ...prev,
      { type: availableTypes[0], count: 1, marks: 1 },
    ]);
  }

  function removeQuestionType(index: number) {
    if (questionConfigs.length <= 1) return;
    setQuestionConfigs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestionCount(index: number, value: number) {
    setQuestionConfigs((prev) =>
      prev.map((q, i) => (i === index ? { ...q, count: value } : q)),
    );
  }

  function updateQuestionMarks(index: number, value: number) {
    setQuestionConfigs((prev) =>
      prev.map((q, i) => (i === index ? { ...q, marks: value } : q)),
    );
  }

  /* Validation */
  function validateStep1(): Record<string, string> {
    const e: Record<string, string> = {};
    if (title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!className_.trim()) e.className = 'Class / Grade is required';
    if (!topic.trim()) e.topic = 'Topic is required';
    if (!dueDate) e.dueDate = 'Due date is required';
    if (questionConfigs.length < 1) e.questionConfigs = 'At least one question type is required';
    return e;
  }

  function nextStep() {
    const validationErrors = validateStep1();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function prevStep() {
    setStep(1);
    setSubmitError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const dur = durationMinutes ? parseInt(durationMinutes, 10) : undefined;

      const newAssignment = await createAssignment(
        {
          title: title.trim(),
          subject: subject.trim(),
          className: className_.trim(),
          topic: topic.trim(),
          dueDate: formatDateForDisplay(dueDate),
          durationMinutes: dur,
          instructions: instructions.trim() || undefined,
          questionConfigs,
        },
        file,
      );

      // Auto-trigger generation and navigate to status
      try {
        await generateAssignment(newAssignment.id);
        router.push(`/assignments/${newAssignment.id}/status`);
      } catch {
        // Generation trigger failed — go to dashboard instead
        router.push('/assignments');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to create assignment. Make sure the API server is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── Render ───────────────────────────────────────────────────────────── */

  return (
    <div>
      <AssignmentStepper currentStep={step} className="mt-4 lg:mt-0" />

      {step === 1 ? (
        /* ─── Step 1: Assignment Details ─────────────────────────────────── */
        <div className="bg-surface-panel rounded-[32px] p-5 lg:p-8 mt-6">
          <h2 className="text-xl font-bold text-text-primary">Assignment Details</h2>
          <p className="text-sm text-text-muted mt-1">Basic information about your assignment</p>

          <FileUploadZone file={file} onFileChange={setFile} className="mt-6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <FormField label="Assignment Title" error={errors.title} required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quiz on Electricity"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Subject" error={errors.subject} required>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Class / Grade" error={errors.className} required>
              <input
                type="text"
                value={className_}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Grade 10"
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Topic / Chapter" error={errors.topic} required>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Current Electricity"
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <FormField label="Due Date" error={errors.dueDate} required>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={INPUT_CLASS}
              />
            </FormField>

            <FormField label="Duration (minutes)">
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="e.g. 60"
                min={15}
                max={300}
                className={INPUT_CLASS}
              />
            </FormField>
          </div>

          {/* Question Types Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-text-primary">Question Type</h3>
              <div className="hidden lg:flex items-center gap-12 text-xs text-text-muted font-medium">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>

            <div className="space-y-3">
              {questionConfigs.map((q, i) => (
                <QuestionTypeCard
                  key={q.type}
                  label={questionTypeLabels[q.type] || q.type}
                  count={q.count}
                  marks={q.marks}
                  onCountChange={(v) => updateQuestionCount(i, v)}
                  onMarksChange={(v) => updateQuestionMarks(i, v)}
                  onRemove={() => removeQuestionType(i)}
                />
              ))}
            </div>

            {/* Add Question Type */}
            {availableTypes.length > 0 && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={addQuestionType}
                  className="flex items-center gap-2.5 text-sm font-medium text-text-primary cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                    <Plus size={16} className="text-white" />
                  </div>
                  Add Question Type
                </button>
              </div>
            )}

            {errors.questionConfigs && (
              <p className="text-xs text-accent font-medium mt-2">{errors.questionConfigs}</p>
            )}

            {/* Totals */}
            <div className="flex flex-col items-end mt-4 gap-0.5">
              <p className="text-sm font-semibold text-text-primary">
                Total Questions : {totalQuestions}
              </p>
              <p className="text-sm font-semibold text-text-primary">
                Total Marks : {totalMarks}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Step 2: Instructions & Review ──────────────────────────────── */
        <div className="bg-surface-panel rounded-[32px] p-5 lg:p-8 mt-6">
          <h2 className="text-xl font-bold text-text-primary">
            Additional Information
          </h2>
          <p className="text-sm text-text-muted mt-1">For better output</p>

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            className="mt-4 w-full h-40 rounded-2xl border border-dashed border-black/20 bg-surface-soft p-4 text-sm text-text-primary placeholder:text-text-muted outline-none resize-none"
            maxLength={5000}
          />

          <CreateAssignmentReview
            className="mt-6"
            title={title}
            subject={subject}
            classLevel={className_}
            topic={topic}
            dueDate={formatDateForDisplay(dueDate)}
            totalQuestions={totalQuestions}
            totalMarks={totalMarks}
            questionBreakdown={questionConfigs.map((q) => ({
              label: questionTypeLabels[q.type] || q.type,
              count: q.count,
              marks: q.marks,
            }))}
            fileName={file?.name}
          />

          {/* Submit error */}
          {submitError && (
            <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent font-medium">{submitError}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Navigation Buttons ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 pb-28 lg:pb-6">
        {step === 1 ? (
          <div />
        ) : (
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6"
            icon={<ArrowLeft size={16} />}
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}

        {step === 1 ? (
          <Button
            type="button"
            variant="primary"
            className="rounded-full px-6"
            onClick={nextStep}
          >
            <span className="flex items-center gap-1.5">
              Next
              <ArrowRight size={16} />
            </span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            className="rounded-full px-6"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <span className="flex items-center gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Assignment
                  <ArrowRight size={16} />
                </>
              )}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
