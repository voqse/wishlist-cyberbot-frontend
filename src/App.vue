<script setup lang="ts">
import type { User, Wishlist } from '@/api/types.ts'
import WebApp from '@twa-dev/sdk'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import { fadeVueTransitionProps } from '@/constants'
import { FAKE_USER, FAKE_WISHLIST } from '@/fakeData'

const { t } = useI18n()

const isReady = ref(false)

const user = ref<User>(WebApp.initDataUnsafe.user ?? {} as User)
const wishlist = ref<Wishlist>({} as Wishlist)

onMounted(() => {
  // This is a temporary workaround for a blank screen issue on initial load on Android.
  isReady.value = true

  wishlist.value = FAKE_WISHLIST
  if (import.meta.env.PROD) return
  user.value = FAKE_USER
})
</script>

<template>
  <Transition v-bind="fadeVueTransitionProps">
    <div v-if="isReady" :class="style.appPanel">
      <div>{{ wishlist.title }}</div>
      <div>
        <ul>
          <li v-for="item in wishlist.items" :key="item.id">
            {{ item.text }}
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>
