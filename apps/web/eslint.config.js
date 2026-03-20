import js from '@eslint/js'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      '@tanstack/query': tanstackQuery
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs['recommended-latest'].rules,
      ...tanstackQuery.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'padding-line-between-statements': [
        'error',
        // Keep a line before return
        { blankLine: 'always', prev: '*', next: 'return' },
        // Blank lines after imports, vars
        {
          blankLine: 'always',
          prev: ['import', 'const', 'let', 'var'],
          next: '*'
        },
        {
          blankLine: 'any',
          prev: ['import', 'const', 'let', 'var'],
          next: ['import', 'const', 'let', 'var']
        },
        // Add spacing before if, for, while, switch
        {
          blankLine: 'always',
          prev: '*',
          next: ['if', 'for', 'while', 'switch', 'try']
        },
        // Add spacing after blocks and functions
        {
          blankLine: 'always',
          prev: ['block', 'block-like', 'function', 'multiline-expression'],
          next: '*'
        },
        // Optional: before function declarations (helps in React utils)
        {
          blankLine: 'always',
          prev: '*',
          next: 'function'
        }
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-unsafe-optional-chaining': 'error',
      'react/jsx-no-useless-fragment': 'error',
      curly: ['error', 'all']
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          paths: ['src']
        },
        alias: {
          map: [['@', './src']],
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    }
  },
  {
    // Jest
    files: [
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}',
      'src/tests/jest.setup.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.jest,
        global: true
      }
    }
  },
  {
    // Playwright
    files: ['e2e/**/*.{js,jsx}', 'playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    // Build and config files
    files: ['vite.config.js', '*.config.js', '*.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  ...storybook.configs['flat/recommended'],
  {
    // shadcn/ui components export both components and variants
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
]
