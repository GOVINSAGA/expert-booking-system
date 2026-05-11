import * as esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/server/server.cjs',
  external: ['express', 'mongoose', 'socket.io', 'cors', 'zod', 'mongodb-memory-server', 'vite'],
}).catch(() => process.exit(1));
