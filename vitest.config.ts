/// <reference types="vitest" />
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '~ui': path.resolve(__dirname, './src/components/ui')
    }
  }
})
