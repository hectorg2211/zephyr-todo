import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { withZephyr } from 'vite-plugin-zephyr';
import Inspect from 'vite-plugin-inspect';
import { createOpenAiMiddleware } from './server/vite-openai-middleware.mjs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;

  // Skip Zephyr plugin on Render (and similar CI): it requires full git history, which shallow clones don't have.
  const isRender = process.env.RENDER === 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      Inspect({ build: true, outputDir: 'dist/.vite-inspect' }),
      ...(isRender ? [] : [withZephyr()]),
      {
        name: 'openai-api',
        configureServer(server) {
          server.middlewares.use(createOpenAiMiddleware());
        },
      },
    ],
  };
});
