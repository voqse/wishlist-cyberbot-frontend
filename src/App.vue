<script setup lang="ts">
import type { TransitionProps } from 'vue'
import WebApp from '@twa-dev/sdk'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import { baseVueTransitionProps } from '@/constants'
import { FAKE_USER } from '@/fakeData'

const transition: TransitionProps = {
  ...baseVueTransitionProps,
  enterFromClass: style.fadeEnterFrom,
  enterActiveClass: style.fadeEnterActive,
  leaveActiveClass: style.fadeLeaveActive,
  leaveToClass: style.fadeLeaveTo,
}

const { t } = useI18n()

const ready = ref(false)
const user = ref(WebApp.initDataUnsafe.user ?? {})

onMounted(() => {
  // This is a temporary workaround for a blank screen issue on initial load on Android.
  ready.value = true

  if (import.meta.env.PROD) return
  user.value = FAKE_USER
})
</script>

<template>
  <Transition v-bind="transition">
    <template v-if="ready">
      <dl :class="style.appPanel">
        <template v-for="[key, value] in Object.entries(user)" :key>
          <dt>{{ key }}</dt>
          <dd>{{ value }}</dd>
        </template>
      </dl>
    </template>
  </Transition>
</template>
