<script setup lang="ts">
import { ref } from 'vue'
import style from '@/assets/scss/base.module.scss'
import { fadeVueTransitionProps } from '@/constants'

const props = defineProps<{
  src: string
  alt: string
}>()

const isReady = ref(false)
</script>

<template>
  <div :class="style.appTitlePhoto">
    <Transition v-bind="fadeVueTransitionProps">
      <img v-show="isReady" v-bind="props" @load="isReady = true">
    </Transition>
  </div>
</template>
