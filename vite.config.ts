import { fileURLToPath, URL } from 'node:url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const __NODE_ENV__ = env.NODE_ENV ?? (mode !== 'production' ? 'development' : 'production')
  const __DEV__ = mode !== 'production' || __NODE_ENV__ !== 'production' || Boolean(env.DEV_ENV)

  return {
    server: {
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          secure: false,
          ws: true,
        },
      },
    },
    plugins: [
      vue(),
      vueDevTools(),
      basicSsl(),
      svgLoader(),
      VueI18nPlugin({
        include: [resolve('./src/locales/**')],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve('./src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: (content) => {
            // Injects a SCSS variable `$vite-dev` that indicates if the build is in development mode
            return `$vite-dev: ${__DEV__};\n${content}`
          },
        },
      },
      modules: {
        // Generates CSS module class names:
        // - Development: Includes the local class name and a short hash for easier debugging.
        // - Production: Uses a compact hash-only format for better performance and smaller file sizes.
        generateScopedName: __DEV__ ? '[local]-[hash:base64:4]' : `[hash:base64:4]`,
        hashPrefix: `wishlist-`,
      },
    },
    define: {
      __DEV__: JSON.stringify(__DEV__),
      __TEST__: JSON.stringify(Boolean(env.TEST_ENV)),

      __API_BASE__: JSON.stringify(env.API_BASE),
      __API_WS_BASE__: JSON.stringify(env.API_WS_BASE),
      __TG_BOT_NAME__: JSON.stringify(env.TG_BOT_NAME),

      __DEV_INIT_DATA__: JSON.stringify(env.DEV_INIT_DATA),
      __DEV_START_PARAM__: JSON.stringify(env.DEV_START_PARAM),
    },
  }
})
