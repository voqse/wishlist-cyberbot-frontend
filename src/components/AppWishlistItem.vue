<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import style from '@/assets/scss/base.module.scss'

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
      <input v-model="modelValue" placeholder="Item" type="text" :class="style.appListInput">
      <button v-if="isOwner" @click="emit('delete')">
        Delete
      </button>
    </template>
    <template v-else>
      <div>
        Checkbox
      </div>
      <div>
        {{ modelValue }}
      </div>
    </template>
  </li>
</template>
