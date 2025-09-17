import WebApp from '@twa-dev/sdk'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import style from '@/assets/scss/base.module.scss'
import i18n from '@/i18n'
import router from '@/router'

function createRootEl() {
  const root = document.createElement('div')
  root.setAttribute('id', style.app)
  document.body.appendChild(root)
  return root
}

const root = createRootEl()
const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(i18n)

app.mount(root)

requestAnimationFrame(() => WebApp.ready())
