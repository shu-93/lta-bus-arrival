import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/health')) {
          try {
            const mod = await import('./api/health.ts');
            return await mod.default(req, res);
          } catch (err) {
            console.error('Error in /api/health middleware:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }
        if (url.startsWith('/api/busarriavl') || url.startsWith('/api/busarrival')) {
          try {
            const mod = await import('./api/busarriavl.ts');
            return await mod.default(req, res);
          } catch (err) {
            console.error('Error in /api/busarriavl middleware:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

