<script setup lang="ts">
import type { Item } from '@/api/types'
import { useVModel, whenever } from '@vueuse/core'
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppTextarea from '@/components/AppTextarea.vue'

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
const itemRef = useTemplateRef('itemRef')
const inputRef = useTemplateRef('inputRef')
const active = ref(false)
const readyToRemove = ref(false)
const steadyToRemove = ref(false)

function resetRemovalState() {
  readyToRemove.value = false
  steadyToRemove.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Backspace') return
  if (modelValue.value) return
  event.preventDefault()
  readyToRemove.value = true

  if (!steadyToRemove.value) return
  emit('remove')
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.key !== 'Backspace') return
  if (!readyToRemove.value) return
  if (modelValue.value) return
  event.preventDefault()
  steadyToRemove.value = true
}

function handleFocusOut(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  if (itemRef.value?.contains(relatedTarget)) return
  resetRemovalState()
  active.value = false
}

whenever(modelValue, resetRemovalState)

onMounted(async () => {
  await nextTick()
  if (!inputRef.value) return
  inputRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  inputRef.value.$el.focus()
})

// Expose element for use with onClickOutside
defineExpose({
  inputRef,
})
</script>

<template>
  <li
    ref="itemRef"
    :class="[
      style.appListItem,
      active && style.appListEditItemActive,
      steadyToRemove && style.appListEditItemRemoving,
    ]"
    @focusin="active = true"
    @focusout="handleFocusOut"
  >
    <AppCheckbox disabled />
    <AppTextarea
      ref="inputRef"
      v-model="modelValue"
      type="text"
      :placeholder
      :class="style.appListEditItemTextarea"
      tabindex="1"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
    />
    <button :class="style.appListItemAction" tabindex="2" @click="emit('remove')">
      {{ t('common.remove') }}
    </button>
  </li>
</template>
