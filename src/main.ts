import WebApp from '@twa-dev/sdk'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import style from '@/assets/scss/base.module.scss'
import i18n, { setLocale } from '@/i18n'
import router from '@/router'

WebApp.ready()

const root = document.createElement('div')
root.setAttribute('id', style.app)
document.body.appendChild(root)

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(i18n)

setLocale()

app.mount(root)
