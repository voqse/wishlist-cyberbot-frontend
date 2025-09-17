<script setup lang="ts">
import { fadeVueTransitionProps } from '@/constants'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition v-bind="fadeVueTransitionProps">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
