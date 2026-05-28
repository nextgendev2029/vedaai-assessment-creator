import { env } from '../../config/env';
import { redis } from '../../config/redis';
import type { IAssignment } from '../../models/assignment.model';
import type { GeneratedPaperData } from '@vedaai/shared';
import type { AIGenerationResult, AIGenerationMetadata, AIProviderName } from './ai-provider.types';
import { buildAssessmentPrompt, buildPromptHash } from './prompt-builder.service';
import { generateWithGemini } from './gemini.service';
import { generateWithGroq } from './groq.service';
import { validateAndNormalizePaper } from './generated-paper.schema';
import { generateMockPaper } from '../mock-generation.service';

const CACHE_PREFIX = 'ai:paper:';
const CACHE_TTL = 86400; // 24 hours

/**
 * Main entry point: generate an assessment paper using the configured AI provider.
 * Handles provider selection, validation, repair attempts, caching, and fallback.
 *
 * Fallback chain:
 *   AI_PROVIDER=mock  → mock (no fallback)
 *   AI_PROVIDER=gemini → Gemini → Groq (if enabled) → mock (if enabled)
 *   AI_PROVIDER=groq   → Groq → mock (if enabled)
 */
export async function generateAssessmentPaper(
  assignment: IAssignment,
  options: { force?: boolean } = {},
): Promise<AIGenerationResult> {
  const provider = env.AI_PROVIDER as 'mock' | 'gemini' | 'groq';

  // ── Mock provider ─────────────────────────────────────────────────────
  if (provider === 'mock') {
    return useMockGeneration(assignment, 'mock');
  }

  // ── Gemini provider ───────────────────────────────────────────────────
  if (provider === 'gemini') {
    return generateWithGeminiPipeline(assignment, options);
  }

  // ── Groq provider ────────────────────────────────────────────────────
  if (provider === 'groq') {
    return generateWithGroqPipeline(assignment, options);
  }

  // Should never reach here due to enum validation, but fail safe
  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}

/* ─── Gemini pipeline ────────────────────────────────────────────────────── */

async function generateWithGeminiPipeline(
  assignment: IAssignment,
  options: { force?: boolean },
): Promise<AIGenerationResult> {
  const promptHash = buildPromptHash(assignment, `gemini:${env.GEMINI_MODEL}`);

  // Check cache (skip if force)
  if (!options.force) {
    const cached = await getCachedPaper(promptHash);
    if (cached) {
      console.log(`📦 Cache hit for prompt hash: ${promptHash}`);
      return {
        paper: cached,
        metadata: {
          provider: 'gemini',
          model: env.GEMINI_MODEL,
          promptHash,
          fallbackUsed: false,
          validationWarnings: [],
          generatedAt: new Date().toISOString(),
        },
      };
    }
  }

  // Check if API key is available
  if (!env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set');
    return fallbackFromGemini(assignment, options, 'GEMINI_API_KEY is not configured');
  }

  try {
    return await generateWithAI(assignment, promptHash, 'gemini');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Gemini error';
    console.error(`❌ Gemini generation failed: ${errorMsg}`);
    return fallbackFromGemini(assignment, options, errorMsg);
  }
}

/**
 * Fallback chain when Gemini fails:
 * 1. Try Groq if AI_FALLBACK_TO_GROQ=true and GROQ_API_KEY is set
 * 2. Try mock if AI_FALLBACK_TO_MOCK=true
 * 3. Throw error
 */
async function fallbackFromGemini(
  assignment: IAssignment,
  options: { force?: boolean },
  originalError: string,
): Promise<AIGenerationResult> {
  // Try Groq fallback
  if (env.AI_FALLBACK_TO_GROQ && env.GROQ_API_KEY) {
    console.warn('⚠️ Falling back to Groq after Gemini failure');
    try {
      const promptHash = buildPromptHash(assignment, `groq:${env.GROQ_MODEL}`);

      // Check cache for Groq result
      if (!options.force) {
        const cached = await getCachedPaper(promptHash);
        if (cached) {
          console.log(`📦 Cache hit for Groq fallback hash: ${promptHash}`);
          return {
            paper: { ...cached, generatedBy: 'groq_fallback' as const },
            metadata: {
              provider: 'groq_fallback',
              model: env.GROQ_MODEL,
              promptHash,
              fallbackUsed: true,
              validationWarnings: [`Gemini unavailable: ${originalError}`],
              generatedAt: new Date().toISOString(),
            },
          };
        }
      }

      const result = await generateWithAI(assignment, promptHash, 'groq');
      // Override to mark as fallback
      result.paper.generatedBy = 'groq_fallback';
      result.metadata.provider = 'groq_fallback';
      result.metadata.fallbackUsed = true;
      result.metadata.validationWarnings.unshift(`Gemini unavailable: ${originalError}`);
      return result;
    } catch (groqErr) {
      const groqErrorMsg = groqErr instanceof Error ? groqErr.message : 'Unknown Groq error';
      console.error(`❌ Groq fallback also failed: ${groqErrorMsg}`);
      // Fall through to mock fallback
    }
  }

  // Try mock fallback
  if (env.AI_FALLBACK_TO_MOCK) {
    console.warn('⚠️ Falling back to mock generation');
    return useMockGeneration(assignment, 'mock_fallback');
  }

  throw new Error(`AI generation failed: ${originalError}`);
}

/* ─── Groq pipeline ──────────────────────────────────────────────────────── */

async function generateWithGroqPipeline(
  assignment: IAssignment,
  options: { force?: boolean },
): Promise<AIGenerationResult> {
  const promptHash = buildPromptHash(assignment, `groq:${env.GROQ_MODEL}`);

  // Check cache (skip if force)
  if (!options.force) {
    const cached = await getCachedPaper(promptHash);
    if (cached) {
      console.log(`📦 Cache hit for prompt hash: ${promptHash}`);
      return {
        paper: cached,
        metadata: {
          provider: 'groq',
          model: env.GROQ_MODEL,
          promptHash,
          fallbackUsed: false,
          validationWarnings: [],
          generatedAt: new Date().toISOString(),
        },
      };
    }
  }

  // Check if API key is available
  if (!env.GROQ_API_KEY) {
    console.warn('⚠️ GROQ_API_KEY not set');
    if (env.AI_FALLBACK_TO_MOCK) {
      console.warn('⚠️ Falling back to mock generation');
      return useMockGeneration(assignment, 'mock_fallback');
    }
    throw new Error('GROQ_API_KEY is not configured and fallback is disabled');
  }

  try {
    return await generateWithAI(assignment, promptHash, 'groq');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Groq error';
    console.error(`❌ Groq generation failed: ${errorMsg}`);

    if (env.AI_FALLBACK_TO_MOCK) {
      console.warn('⚠️ Falling back to mock generation after Groq failure');
      return useMockGeneration(assignment, 'mock_fallback');
    }

    throw new Error(`AI generation failed: ${errorMsg}`);
  }
}

/* ─── Shared AI generation with validation + repair ──────────────────────── */

async function generateWithAI(
  assignment: IAssignment,
  promptHash: string,
  aiProvider: 'gemini' | 'groq',
): Promise<AIGenerationResult> {
  const prompt = buildAssessmentPrompt(assignment);
  const model = aiProvider === 'gemini' ? env.GEMINI_MODEL : env.GROQ_MODEL;
  const generateFn = aiProvider === 'gemini' ? generateWithGemini : generateWithGroq;

  // Attempt 1: Generate
  console.log(`🤖 Attempt 1: Generating paper with ${aiProvider}...`);
  let rawOutput = await generateFn(prompt);

  // Validate
  let validation = validateAndNormalizePaper(rawOutput, assignment.totalMarks);

  // Attempt 2: Repair if validation failed
  if (!validation.valid) {
    console.warn(`⚠️ ${aiProvider} validation failed on first attempt, trying repair...`);
    console.warn('Errors:', validation.errors.slice(0, 5).join('; '));

    const repairPrompt = buildRepairPrompt(prompt, validation.errors);
    rawOutput = await generateFn(repairPrompt);
    validation = validateAndNormalizePaper(rawOutput, assignment.totalMarks);

    if (!validation.valid) {
      throw new Error(
        `${aiProvider} output failed validation after repair: ${validation.errors.slice(0, 3).join('; ')}`,
      );
    }
    console.log(`✅ ${aiProvider} repair attempt succeeded`);
  }

  const paper: GeneratedPaperData = {
    ...validation.paper!,
    generatedBy: aiProvider,
  };

  // Cache validated result
  await cachePaper(promptHash, paper);

  const metadata: AIGenerationMetadata = {
    provider: aiProvider,
    model,
    promptHash,
    fallbackUsed: false,
    validationWarnings: validation.warnings,
    generatedAt: new Date().toISOString(),
  };

  return { paper, metadata };
}

/* ─── Mock generation helper ────────────────────────────────────────────── */

function useMockGeneration(
  assignment: IAssignment,
  providerName: AIProviderName,
): AIGenerationResult {
  const paper = generateMockPaper(assignment);

  return {
    paper: {
      ...paper,
      generatedBy: providerName === 'mock_fallback' ? 'mock' : 'mock',
    },
    metadata: {
      provider: providerName,
      model: undefined,
      promptHash: undefined,
      fallbackUsed: providerName === 'mock_fallback',
      validationWarnings: providerName === 'mock_fallback'
        ? ['AI provider unavailable; generated with local fallback']
        : [],
      generatedAt: new Date().toISOString(),
    },
  };
}

/* ─── Repair prompt builder ─────────────────────────────────────────────── */

function buildRepairPrompt(originalPrompt: string, errors: string[]): string {
  return [
    originalPrompt,
    '',
    '## IMPORTANT: Fix These Errors',
    'Your previous response had validation errors. Fix them:',
    ...errors.map((e, i) => `${i + 1}. ${e}`),
    '',
    'Return the CORRECTED JSON object only. No explanations.',
  ].join('\n');
}

/* ─── Cache helpers ──────────────────────────────────────────────────────── */

async function getCachedPaper(hash: string): Promise<GeneratedPaperData | null> {
  try {
    const cached = await redis.get(`${CACHE_PREFIX}${hash}`);
    if (cached) {
      return JSON.parse(cached) as GeneratedPaperData;
    }
  } catch {
    // Cache miss or parse error — not critical
  }
  return null;
}

async function cachePaper(hash: string, paper: GeneratedPaperData): Promise<void> {
  try {
    await redis.set(
      `${CACHE_PREFIX}${hash}`,
      JSON.stringify(paper),
      'EX',
      CACHE_TTL,
    );
    console.log(`📦 Cached paper with hash: ${hash}`);
  } catch {
    // Cache write failure — not critical
    console.warn('⚠️ Failed to cache generated paper');
  }
}
