'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { connectSocket } from '@/lib/socket-client';
import type { GenerationJobState } from '@/lib/api-client';

export function useGenerationSocket(assignmentId: string | null) {
  const [state, setState] = useState<GenerationJobState | null>(null);
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const joinedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    // Join room
    socket.emit('assignment:join', { assignmentId });
    joinedRef.current = assignmentId;

    // Listeners
    const handleUpdate = (data: GenerationJobState) => {
      if (data.assignmentId === assignmentId) {
        setState(data);
      }
    };

    socket.on('generation:update', handleUpdate);
    socket.on('generation:completed', handleUpdate);
    socket.on('generation:failed', handleUpdate);

    return () => {
      socket.off('generation:update', handleUpdate);
      socket.off('generation:completed', handleUpdate);
      socket.off('generation:failed', handleUpdate);

      if (joinedRef.current) {
        socket.emit('assignment:leave', { assignmentId: joinedRef.current });
        joinedRef.current = null;
      }
    };
  }, [assignmentId]);

  const reset = useCallback(() => setState(null), []);

  return { state, setState, reset };
}
