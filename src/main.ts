import WebApp from '@twa-dev/sdk'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import i18n, { setLocale } from '@/i18n'
import App from './App.vue'
import router from './router'

WebApp.ready()

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(i18n)

setLocale()

app.mount('#app')
