<script setup lang="ts">
import type { Item } from '@/api/types'
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'

const props = defineProps<{
  modelValue: Item['text']
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item): void
  (e: 'remove'): void
}>()

const { t } = useI18n()

const modelValue = useVModel(props, 'modelValue', emit)
</script>

<template>
  <li :class="style.appListItem">
    <AppCheckbox disabled />
    <input
      v-model="modelValue"
      type="text"
      :placeholder
      :class="style.appListInput"
    >
    <button :class="style.appListItemAction" @click="emit('remove')">
      {{ t('common.remove') }}
    </button>
  </li>
</template>
