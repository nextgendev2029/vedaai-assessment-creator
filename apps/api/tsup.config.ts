import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    worker: 'src/worker.ts',
  },
  outDir: 'dist',
  format: ['cjs'],
  target: 'node20',
  clean: true,
  sourcemap: true,
  splitting: false,
  // Bundle the workspace @vedaai/shared package into the output
  noExternal: ['@vedaai/shared'],
});
