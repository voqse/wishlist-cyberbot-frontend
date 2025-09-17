<script setup lang="ts">
import sanitizeHtml from 'sanitize-html'
import { onMounted, useTemplateRef, watch } from 'vue'
import style from '@/assets/scss/base.module.scss'

const props = defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const sanitizeConf = {
  allowedTags: ['b', 'i', 'a', 'br', 'div'],
  allowedAttributes: { a: ['href'] },
}

const contenteditableRef = useTemplateRef('contenteditableRef')

function getContent() {
  return sanitizeHtml(contenteditableRef.value!.innerHTML, sanitizeConf)
}

function setContent(value: string) {
  contenteditableRef.value!.innerHTML = sanitizeHtml(value, sanitizeConf)
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
