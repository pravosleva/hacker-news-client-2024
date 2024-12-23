import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json'

const GIT_SHA1 = process.env.VITE_GIT_SHA1

// NOTE: See also https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),

    // NOTE: Last one
    // See also https://www.npmjs.com/package/rollup-plugin-visualizer
    visualizer({
      title: `Stats | HN client app v${pkg.version} | GIT SHA1 ${GIT_SHA1}`,
      template: 'sunburst', // sunburst, treemap, network
      emitFile: true,
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
