import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'

export default defineConfig([
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
])
