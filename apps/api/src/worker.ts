import 'dotenv/config';
import { createAssessmentWorker } from './workers/assessment.worker';
import { createPdfWorker } from './workers/pdf.worker';
import { redis } from './config/redis';
import { connectDB } from './config/db';

async function start(): Promise<void> {
  try {
    // Connect to MongoDB (worker needs it to read assignments and save papers)
    await connectDB();

    // Verify Redis connection
    const pong = await redis.ping();
    console.log(`✅ Redis ping: ${pong}`);

    // Create workers
    const assessmentWorker = createAssessmentWorker();
    console.log(`🏗️  Worker running for queue: ${assessmentWorker.name}`);

    const pdfWorker = createPdfWorker();
    console.log(`🏗️  Worker running for queue: ${pdfWorker.name}`);

    // Graceful shutdown
    function shutdown(signal: string): void {
      console.log(`\n🛑 Received ${signal}. Shutting down workers...`);
      Promise.all([assessmentWorker.close(), pdfWorker.close()]).then(() => {
        console.log('✅ Workers closed');
        redis.disconnect();
        console.log('✅ Redis disconnected');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

start();
