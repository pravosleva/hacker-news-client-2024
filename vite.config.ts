import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json'
import slugify from 'slugify'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import { VitePWA } from 'vite-plugin-pwa'

const defaultNodeEnv = 'production'
process.env = {
  ...process.env,
  ...loadEnv(process.env.NODE_ENV || defaultNodeEnv, process.cwd()),
}

const GIT_SHA1 = process.env.VITE_GIT_SHA1
const BRAND_NAME = 'HN'
const isDev = process.env.NODE_ENV === 'development'
const PUBLIC_URL = process.env.VITE_PUBLIC_URL || ''

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
    VitePWA({
      workbox: {
        sourcemap: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 ** 2, // NOTE: 5 MB or set to something else
      },
      registerType: 'autoUpdate',
      minify: false,
      mode: isDev ? 'development' : 'production',
      srcDir: 'public/pwa/', // NOTE: Default 'public'
      outDir: 'dist',
      filename: 'sw.js',
      manifestFilename: 'site.webmanifest', // NOTE: Default 'manifest.webmanifest'
      strategies: 'generateSW',
      injectRegister: 'auto',
      manifest: {
        theme_color: '#ff5500',
        background_color: '#ff5500',
        name: BRAND_NAME,
        short_name: BRAND_NAME,
        start_url: `${PUBLIC_URL}/#/?source=pwa&debug=1`,
        // scope: PUBLIC_URL,
        scope: './',
        icons: [
          {
            src: `${PUBLIC_URL}/pwa/pwa-64x64.png`,
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: `${PUBLIC_URL}/pwa/pwa-192x192.png`,
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: `${PUBLIC_URL}/pwa/pwa-512x512.png`,
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: `${PUBLIC_URL}/pwa/maskable-icon-512x512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        orientation: 'portrait',
        display: 'standalone',
        // display_override: ["fullscreen", "minimal-ui"],
        // dir: 'auto',
        lang: 'en-EN',
      },
      useCredentials: true,
      includeManifestIcons: true,
      disable: isDev,
    }),

    // NOTE: Last one
    // See also https://www.npmjs.com/package/rollup-plugin-visualizer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
