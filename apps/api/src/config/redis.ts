import Redis from 'ioredis';
import { env } from './env';

/**
 * Build ioredis options that work for both local (redis://) and
 * hosted TLS (rediss://) connections.
 * BullMQ requires maxRetriesPerRequest: null.
 */
function buildRedisOptions(): ConstructorParameters<typeof Redis> {
  const url = env.REDIS_URL;
  const useTls = url.startsWith('rediss://');

  const opts: Record<string, unknown> = {
    maxRetriesPerRequest: null, // required by BullMQ
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  };

  return [url, opts] as unknown as ConstructorParameters<typeof Redis>;
}

/** Main Redis client (used by BullMQ, job state, etc.) */
export const redis = new Redis(...buildRedisOptions());

/** Dedicated Redis client for Pub/Sub subscriber (cannot share with BullMQ) */
export const redisSub = new Redis(...buildRedisOptions());

/** Dedicated Redis client for Pub/Sub publisher (used by worker) */
export const redisPub = new Redis(...buildRedisOptions());

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err.message);
});

export function getRedisStatus(): 'connected' | 'disconnected' {
  return redis.status === 'ready' ? 'connected' : 'disconnected';
}

/** Redis Pub/Sub channel for generation progress */
export const GENERATION_PROGRESS_CHANNEL = 'assessment:generation:progress';
