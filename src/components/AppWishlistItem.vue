<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import style from '@/assets/scss/base.module.scss'

const props = defineProps<{
  modelValue: string
  isOwnWishlist?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'delete'): void
}>()

const modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <li>
    <input v-model="modelValue" placeholder="Item" type="text" :class="style.appListInput">
    <button v-if="isOwnWishlist" @click="emit('delete')">
      Delete
    </button>
  </li>
</template>
