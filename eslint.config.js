import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // Global ignores
  { ignores: ['dist/**', 'eslint.config.js'] },

  // TypeScript recommended + type-checked (includes eslint:recommended base)
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // React rules
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // React hooks rules
  reactHooks.configs.flat.recommended,

  // Prettier (must come last to override formatting rules)
  prettier,

  // Project-wide settings and overrides
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // Relaxed rules for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);
