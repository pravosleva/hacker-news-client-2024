import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// NOTE: See also https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
    extensions: [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ]
  },
})
