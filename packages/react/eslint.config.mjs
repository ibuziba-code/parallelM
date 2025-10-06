import js from '@eslint/js'
import globals from 'globals'
import { FlatCompat } from '@eslint/eslintrc'
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

const OFF = 0,
  WARN = 1,
  ERROR = 2

const compat = new FlatCompat()

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends('prettier', 'plugin:react-hooks/recommended'),
  {
    plugins: {
      react,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: ['../../tsconfig.json'],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react-hooks/exhaustive-deps': OFF,
      'react/prop-types': OFF,
      'node/no-callback-literal': OFF,
      'n/no-callback-literal': OFF,
      camelcase: OFF,
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'sort-vars': ERROR,
      'no-debugger': process.env.NODE_ENV === 'development' ? OFF : ERROR,
      'no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
          // ignore vars that start with underscore, like _result
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|React',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none',
          // ignore vars that start with underscore, like _result
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|React',
        },
      ],
    },
  },
)
