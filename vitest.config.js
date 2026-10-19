import { defineConfig } from 'vitest/config';

const suite = (name) => ({
  test: {
    name,
    include: [`apps/**/test/${name}/**/*.test.js`, `tools/**/test/${name}/**/*.test.js`],
  },
});

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['apps/**/test/unit/**/*.test.js', 'tools/**/test/**/*.test.js'],
        },
      },
      suite('integration'),
      suite('regression'),
    ],
  },
});
