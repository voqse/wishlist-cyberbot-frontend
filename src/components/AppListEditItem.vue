<script setup lang="ts">
import type { Item } from '@/api/types'
import { useTimeoutFn, useVModel, whenever } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppTextarea from '@/components/AppTextarea.vue'

const props = defineProps<{
  modelValue: Item['text']
  placeholder: string
  draggable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item): void
  (e: 'remove'): void
}>()

const { t } = useI18n()

const modelValue = useVModel(props, 'modelValue', emit)
const itemRef = useTemplateRef('itemRef')
const textareaRef = useTemplateRef('textareaRef')
const active = ref(false)
const readyToRemove = ref(false)

function resetRemovalState() {
  readyToRemove.value = false
}

const holdingBackspaceTimer = useTimeoutFn(() => {}, 200, { immediate: false })
const holdingBackspace = computed(() => holdingBackspaceTimer.isPending.value)

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Backspace') return
  if (modelValue.value)
    return holdingBackspaceTimer.start()
  event.preventDefault()

  if (event.repeat)
    return holdingBackspaceTimer.start()

  if (readyToRemove.value)
    return emit('remove')

  if (!holdingBackspace.value)
    return readyToRemove.value = true

  holdingBackspaceTimer.start()
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.key !== 'Backspace') return
  if (modelValue.value)
    return holdingBackspaceTimer.start()
  event.preventDefault()

  holdingBackspaceTimer.start()
}

function handleFocusOut(event: FocusEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  if (itemRef.value?.contains(relatedTarget)) return

  resetRemovalState()
  active.value = false
}

whenever(active, holdingBackspaceTimer.start)

whenever(modelValue, resetRemovalState)

onMounted(async () => {
  await nextTick()
  if (!textareaRef.value) return
  textareaRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  textareaRef.value.$el.focus()
})

defineExpose({
  el: itemRef,
  $el: itemRef,
  focus: () => textareaRef.value?.focus(),
})
</script>

<template>
  <li
    ref="itemRef"
    :draggable="draggable"
    :class="[
      style.appListItem,
      active && style.appListEditItemActive,
      readyToRemove && style.appListEditItemRemoving,
    ]"
    @focusin="active = true"
    @focusout="handleFocusOut"
  >
    <AppCheckbox disabled />
    <AppTextarea
      ref="textareaRef"
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
