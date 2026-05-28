import Groq from 'groq-sdk';
import { env } from '../../config/env';

/**
 * Call Groq API with a prompt and return parsed JSON.
 * Uses response_format: json_object for structured output.
 */
export async function generateWithGroq(prompt: string): Promise<unknown> {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const client = new Groq({ apiKey: env.GROQ_API_KEY });

  console.log(`🤖 Calling Groq model: ${env.GROQ_MODEL}`);
  const startTime = Date.now();

  const chatCompletion = await client.chat.completions.create({
    model: env.GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert teacher and assessment designer. You MUST return ONLY valid JSON. No markdown, no explanations, no extra text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: env.GROQ_TEMPERATURE,
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  });

  const elapsed = Date.now() - startTime;
  console.log(`🤖 Groq responded in ${elapsed}ms`);

  const text = chatCompletion.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq returned empty response');
  }

  return parseJsonRobust(text);
}

/**
 * Parse JSON from Groq output, handling common LLM quirks:
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
