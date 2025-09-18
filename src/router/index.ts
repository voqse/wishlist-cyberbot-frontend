import WebApp from '@twa-dev/sdk'
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/api'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: `/`,
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: `/unauthorised`,
      name: 'Unauthorised',
      component: () => import('@/views/UnauthorisedView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const initData = WebApp.initData || __DEV_INIT_DATA__
  const shareId = WebApp.initDataUnsafe.start_param || __DEV_START_PARAM__
  const user = await auth(initData)

  if (!initData && !user && to.name !== 'Unauthorised') {
    return { name: 'Unauthorised' }
  }

  await useAppStore().init(user, shareId)

  if (to.name === 'Unauthorised') {
    return { ...to, name: 'Home' }
  }
})

export default router
