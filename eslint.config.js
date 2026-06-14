import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**'] },

  // Base rules for all JS files
  js.configs.recommended,

  // Root Node.js config files (playwright, etc.)
  {
    files: ['*.js', '*.cjs', '*.mjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Server — Node ESM
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Client test files — Vitest runs under Node so `global` is available
  {
    files: ['client/**/__tests__/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // Client — React + browser
  {
    files: ['client/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off', // not needed with Vite's JSX transform
    },
  },

  // Prettier must be last — disables any ESLint rules that conflict with formatting
  prettier,
];
