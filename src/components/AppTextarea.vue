<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { onMounted, useTemplateRef, watch } from 'vue'
import style from '@/assets/scss/base.module.scss'

const props = defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const contenteditableRef = useTemplateRef('contenteditableRef')
const modelValue = useVModel(props, 'modelValue', emit)

function getContent() {
  return contenteditableRef.value!.textContent
}

function setContent(value: string) {
  contenteditableRef.value!.textContent = value
}

function handleInput() {
  const content = getContent()
  emit('update:modelValue', content)

  if (content) return
  contenteditableRef.value!.innerHTML = ''
}

function handlePaste(event: any) {
  event.preventDefault()
  const text = (event.originalEvent || event).clipboardData.getData('text/plain')
  window.document.execCommand('insertText', false, text)
}

onMounted(() => {
  setContent(modelValue.value ?? '')
})

watch(() => props.modelValue, (value) => {
  if (value === getContent()) return
  setContent(value ?? '')
})

defineExpose({
  el: contenteditableRef,
  $el: contenteditableRef,
})
</script>

<template>
  <div
    ref="contenteditableRef"
    contenteditable="true"
    :class="[style.appTextarea, !modelValue && style.appTextareaPlaceholder]"
    :placeholder
    @input="handleInput"
    @blur="handleInput"
    @paste="handlePaste"
  />
</template>
