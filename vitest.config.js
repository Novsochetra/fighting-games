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

// The React plugin compiles the arcade's components for the tests as the build does.
export default defineConfig({
  plugins: [react()],
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
