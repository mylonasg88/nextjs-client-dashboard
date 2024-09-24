import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
      '*.cjs',
      '*.config.*',
    ],
  },
  { files: ['**/*.{js,mjs,ts,jsx,tsx}', 'tests/**/*.{js,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Custom rules, must be last
  {
    rules: {
      semi: 'error',
      'eol-last': ['error', 'always'], // Ensure a newline at the end of files
      'prefer-const': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/no-unescaped-entities': 'off',
      // Ensure an empty line before return statements
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
      // Ensure spaces around if statements
      'keyword-spacing': ['error', { before: true, after: true }],
    },
  },
];
