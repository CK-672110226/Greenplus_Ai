import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'Greenplus/', 'docs/', '.claude/', '.claude-flow/']),

  // React app source (browser environment)
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // Node.js config files & E2E tests (Node environment)
  {
    files: ['playwright.config.js', 'vite.config.*', 'e2e/**/*.{js,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Vitest test files — expose test globals
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        describe: 'readonly', it: 'readonly', expect: 'readonly',
        beforeAll: 'readonly', afterAll: 'readonly',
        afterEach: 'readonly', beforeEach: 'readonly',
        vi: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
