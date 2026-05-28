import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';

/**
 * Call Gemini API with a prompt and return parsed JSON.
 * Uses structured JSON output mode when available.
 */
export async function generateWithGemini(prompt: string): Promise<unknown> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  console.log(`🤖 Calling Gemini model: ${env.GEMINI_MODEL}`);
  const startTime = Date.now();

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: env.GEMINI_TEMPERATURE,
      responseMimeType: 'application/json',
    },
  });

  const elapsed = Date.now() - startTime;
  console.log(`🤖 Gemini responded in ${elapsed}ms`);

  // Extract text from response
  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  // Parse JSON robustly
  return parseJsonRobust(text);
}

/**
 * Parse JSON from Gemini output, handling common LLM quirks:
 * - Code fences (```json ... ```)
 * - Leading/trailing whitespace
 * - Trailing commas (basic cleanup)
 */
function parseJsonRobust(raw: string): unknown {
  let text = raw.trim();

  // Remove code fences
  if (text.startsWith('```')) {
    const firstNewline = text.indexOf('\n');
    text = text.substring(firstNewline + 1);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.lastIndexOf('```'));
  }

  text = text.trim();

  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {
    // Try removing trailing commas before } and ]
    const cleaned = text
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    return JSON.parse(cleaned);
  }
}
