import http from 'http';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, getAllowedOrigins } from './config/env';
import { connectDB } from './config/db';
import { redis } from './config/redis';
import healthRouter from './routes/health.routes';
import assignmentRouter from './routes/assignment.routes';
import generationRouter from './routes/generation.routes';
import { pdfRouter } from './routes/pdf.routes';
import { initializeSocket } from './sockets/socket';
import { assessmentQueue } from './queues/assessment.queue';
import { pdfQueue } from './services/pdf/pdf-state.service';
import { AppError, ValidationError } from './utils/errors';
import { error as apiError } from './utils/api-response';
import { createAssessmentWorker } from './workers/assessment.worker';
import { createPdfWorker } from './workers/pdf.worker';
import type { Worker } from 'bullmq';

const app = express();
const server = http.createServer(app);

// References to embedded workers for graceful shutdown
let embeddedAssessmentWorker: Worker | null = null;
let embeddedPdfWorker: Worker | null = null;

// ─── CORS setup ──────────────────────────────────────────────────────────────
const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, health checks, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/assignments', assignmentRouter);
app.use('/api/assignments', generationRouter);
app.use('/api/assignments', pdfRouter);

// ─── Centralized error handler ──────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  // Multer file size error
  if (err.message?.includes('File too large')) {
    res.status(400).json(apiError('File size exceeds 10MB limit'));
    return;
  }

  // Multer file type error
  if (err.message?.startsWith('Unsupported file type')) {
    res.status(400).json(apiError(err.message));
    return;
  }

  // Zod / custom validation error
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json(apiError(err.message, err.errors));
    return;
  }

  // Custom app error (404, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(apiError(err.message));
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json(apiError('Invalid ID format'));
    return;
  }

  // Unknown server error
  console.error('❌ Unhandled error:', err);
  res.status(500).json(apiError('Internal server error'));
});

async function start(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify Redis connection
    const pong = await redis.ping();
    console.log(`✅ Redis ping: ${pong}`);

    // Initialize Socket.IO
    const io = initializeSocket(server);
    console.log(`🔗 Socket.IO initialized with ${io.engine?.clientsCount ?? 0} clients`);

    // Log queue info
    console.log(`📋 Assessment queue: ${assessmentQueue.name}`);
    console.log(`📋 PDF queue: ${pdfQueue.name}`);

    // Start HTTP server
    server.listen(env.PORT, () => {
      console.log('');
      console.log('🚀 VedaAI API Server');
      console.log(`   Port:     ${env.PORT}`);
      console.log(`   Env:      ${env.AI_PROVIDER}`);
      console.log(`   Web URL:  ${env.WEB_URL}`);
      console.log('');
    });

    // Start embedded workers if enabled
    if (env.ENABLE_EMBEDDED_WORKER) {
      console.log('Embedded workers enabled');
      embeddedAssessmentWorker = createAssessmentWorker();
      console.log('Assessment worker started in API process');
      embeddedPdfWorker = createPdfWorker();
      console.log('PDF worker started in API process');
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  const closeWorkers: Promise<void>[] = [];
  if (embeddedAssessmentWorker) {
    closeWorkers.push(embeddedAssessmentWorker.close());
  }
  if (embeddedPdfWorker) {
    closeWorkers.push(embeddedPdfWorker.close());
  }

  Promise.all(closeWorkers)
    .then(() => {
      if (closeWorkers.length > 0) {
        console.log('✅ Embedded workers closed');
      }
      server.close(() => {
        console.log('✅ HTTP server closed');
        redis.disconnect();
        console.log('✅ Redis disconnected');
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error('❌ Error during graceful worker shutdown:', err);
      process.exit(1);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
