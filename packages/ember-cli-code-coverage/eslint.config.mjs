import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'src/babel/gjs-gts-istanbul-ignore-template-plugin.cjs',
      'addon-main.cjs',
      'glimmer-plugin.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Type-aware linting covers the TypeScript sources only. The browser
    // runtime below is authored as plain ESM and never enters tsconfig.
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Shipped as-is to the browser: the template coverage runtime and the
    // app-tree re-exports that make its helpers resolvable.
    files: ['runtime/**/*.js', '_app_/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        console: 'readonly',
      },
    },
  },
];
