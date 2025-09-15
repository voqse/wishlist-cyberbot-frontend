<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'

const props = defineProps<{
  modelValue: string
  isOwner?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'delete'): void
}>()

const modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <li>
    <template v-if="isOwner">
      <AppCheckbox />
      <input v-model="modelValue" placeholder="Item" type="text" :class="style.appListInput">
      <button v-if="isOwner" @click="emit('delete')">
        Delete
      </button>
    </template>
    <template v-else>
      <AppCheckbox>{{ modelValue }}</AppCheckbox>
    </template>
  </li>
</template>
