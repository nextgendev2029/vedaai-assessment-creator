import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { getRedisStatus } from '../config/redis';
import { env } from '../config/env';

const router: Router = Router();

function healthCheckHandler(_req: Request, res: Response): void {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = getRedisStatus();

  const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

  const healthStatus = {
    status: isHealthy ? ('ok' as const) : ('degraded' as const),
    service: 'vedaai-api',
    environment: env.NODE_ENV,
    mongo: mongoStatus,
    redis: redisStatus,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  res.status(isHealthy ? 200 : 503).json(healthStatus);
}

router.get('/', healthCheckHandler);

export default router;
