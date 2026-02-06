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

  // Module Federation: expose this app as a remote so a host can load it at runtime (see MODULE_FEDERATION.md).
  const mfConfig = {
    name: 'zephyr_todo',
    filename: 'remoteEntry.js',
    exposes: {
      './TodoApp': './src/App.tsx',
      './TodoList': './src/components/TodoList.tsx',
    },
    shared: {
      react: { singleton: true },
      'react-dom': { singleton: true },
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      Inspect({ build: true, outputDir: 'dist/.vite-inspect' }),
      ...(isRender ? [] : [withZephyr({ mfConfig })]),
      {
        name: 'openai-api',
        configureServer(server) {
          server.middlewares.use(createOpenAiMiddleware());
        },
      },
    ],
    build: {
      target: 'chrome89', // Required for Zephyr Module Federation (top-level await)
      modulePreload: {
        resolveDependencies: (_: unknown, deps: string[]) =>
          deps.filter(
            (dep) =>
              (dep.includes('react') || dep.includes('react-dom')) && !dep.includes('remoteEntry.js')
          ),
      },
    },
  };
});
