import { fileURLToPath, URL } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
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
})
