import type { Server as SocketServer } from 'socket.io';
import { redisSub, GENERATION_PROGRESS_CHANNEL } from '../config/redis';
import type { GenerationJobState } from '@vedaai/shared';

let isSubscribed = false;

export function setupProgressSubscriber(io: SocketServer): void {
  if (isSubscribed) return;
  isSubscribed = true;

  redisSub.subscribe(GENERATION_PROGRESS_CHANNEL, (err) => {
    if (err) {
      console.error('❌ Failed to subscribe to generation progress channel:', err.message);
      return;
    }
    console.log(`✅ Subscribed to Redis channel: ${GENERATION_PROGRESS_CHANNEL}`);
  });

  redisSub.on('message', (channel, message) => {
    if (channel !== GENERATION_PROGRESS_CHANNEL) return;

    try {
      const state = JSON.parse(message) as GenerationJobState;
      const room = `assignment:${state.assignmentId}`;

      // Emit to the assignment-specific room
      io.to(room).emit('generation:update', state);

      if (state.status === 'completed') {
        io.to(room).emit('generation:completed', state);
      } else if (state.status === 'failed') {
        io.to(room).emit('generation:failed', state);
      }
    } catch (err) {
      console.error('❌ Failed to parse generation progress event:', err);
    }
  });
}
