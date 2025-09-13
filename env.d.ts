/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />
/// <reference types="@intlify/unplugin-vue-i18n/messages" />

import type { Telegram } from '@twa-dev/types'

declare global {
  interface Window {
    Telegram: Telegram
  }
}
