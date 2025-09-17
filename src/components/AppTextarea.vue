<script setup lang="ts">
import insane from 'insane'
import { onMounted, useTemplateRef, watch } from 'vue'
import style from '@/assets/scss/base.module.scss'

const props = defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const insaneConfig: insane.SanitizeOptions = {
  allowedTags: ['br', 'div'],
  allowedAttributes: {},
}

const contenteditableRef = useTemplateRef('contenteditableRef')

function getContent() {
  return insane(contenteditableRef.value!.innerHTML, insaneConfig)
}

function setContent(value: string) {
  contenteditableRef.value!.innerHTML = insane(value, insaneConfig)
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
  setContent(props.modelValue ?? '')
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
    :class="style.appTextarea"
    :placeholder
    @input="handleInput"
    @blur="handleInput"
    @paste="handlePaste"
  />
</template>
