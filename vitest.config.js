import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const TESTS = '*.test.{js,ts,tsx}';

const suite = (name) => ({
  extends: true,
  test: {
    name,
    include: [`apps/**/test/${name}/**/${TESTS}`, `tools/**/test/${name}/**/${TESTS}`],
  },
});

// The React plugin compiles the arcade's components for the tests as the build does, and @/ is the
// arcade's src/ as in apps/web/arcade/vite.config.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.join(import.meta.dirname, 'apps/web/arcade/src')}/` },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: [`apps/**/test/unit/**/${TESTS}`, `tools/**/test/**/${TESTS}`],
        },
      },
      suite('integration'),
      suite('regression'),
    ],
  },
});
