import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json'
import slugify from 'slugify'
import browserslistToEsbuild from 'browserslist-to-esbuild'

const GIT_SHA1 = process.env.VITE_GIT_SHA1

slugify.extend({ '/': '_' })

function* Counter(initValue: number = 0) {
  let count = initValue
  while (true) yield count++
}
const chuncksCounter = Counter(0)
const modulesToSeparate = [
  'axios',
  'retry-axios',
  '@mui/material',
  '@remix-run',
  'react-dom',
]
const _chunksMap = new Map()

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
  build: {
    // NOTE: See also https://github.com/marcofugaro/browserslist-to-esbuild/blob/main/test/test.js
    target: browserslistToEsbuild(),
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id: string, _manualChunkMeta) {
          for (const moduleSubstr of modulesToSeparate) {
            // NOTE: Reducing the vendor chunk size
            // See also https://dev.to/tassiofront/splitting-vendor-chunk-with-vite-and-loading-them-async-15o3
            if (id.includes(moduleSubstr)) {
              const normalizedModuleSubstr = slugify(moduleSubstr)
              const fromMap = _chunksMap.get(normalizedModuleSubstr)
              if (!fromMap) {
                const chunkName = `chunk.${chuncksCounter.next().value}.${normalizedModuleSubstr}`
                _chunksMap.set(normalizedModuleSubstr, chunkName)
                return chunkName
              } else return _chunksMap.get(normalizedModuleSubstr)
            }
          }
        },
      },
    },
  },
})
