import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  WEB_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // AI provider
  AI_PROVIDER: z.enum(['mock', 'gemini', 'groq']).default('mock'),
  AI_FALLBACK_TO_GROQ: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('false'),
  AI_FALLBACK_TO_MOCK: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('true'),

  // Gemini
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.4),

  // Groq
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.4),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/**
 * Build the list of allowed CORS origins from WEB_URL + ALLOWED_ORIGINS.
 * Used by both Express CORS and Socket.IO CORS.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Always include WEB_URL
  if (env.WEB_URL) {
    origins.add(env.WEB_URL.replace(/\/$/, '')); // strip trailing slash
  }

  // Parse ALLOWED_ORIGINS (comma-separated)
  if (env.ALLOWED_ORIGINS) {
    for (const origin of env.ALLOWED_ORIGINS.split(',')) {
      const trimmed = origin.trim().replace(/\/$/, '');
      if (trimmed) origins.add(trimmed);
    }
  }

  return Array.from(origins);
}
