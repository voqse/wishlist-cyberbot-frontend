<script setup lang="ts">
import type { User, Wishlist } from '@/api/types'
import WebApp from '@twa-dev/sdk'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { auth, getWishlist } from '@/api'
import style from '@/assets/scss/base.module.scss'
import { fadeVueTransitionProps } from '@/constants'

const { t } = useI18n()

const isReady = ref(false)

const initData = ref<string>(WebApp.initData || import.meta.env.VITE_INIT_DATA)
const user = ref<User>()
const wishlist = ref<Wishlist>()

const username = computed(() => user.value
  ? [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.username
  : 'Unauthorised')

const title = computed(() => user.value
  ? `${user.value.firstName || user.value.username}'s wishlist`
  : 'New wishlist')

onMounted(async () => {
  user.value = await auth(initData.value)
  wishlist.value = await getWishlist()

  // This is a temporary workaround for a blank screen issue on initial load on Android.
  isReady.value = true
})
</script>

<template>
  <Transition v-bind="fadeVueTransitionProps">
    <div v-if="isReady" :class="style.appPanel">
      <div>{{ title }}</div>
      <div>
        <div v-if="!wishlist?.items?.length">
          <div>Empty</div>
          <div><button>Add a new wish</button></div>
        </div>
        <ul v-else>
          <li v-for="item in wishlist.items" :key="item.id">
            {{ item.text }}
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>
