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
        '/api': { target: 'http://localhost:3000' },
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
    define: {
      __DEV__: JSON.stringify(__DEV__),
      __TEST__: JSON.stringify(Boolean(env.TEST_ENV)),
    },
  }
})
