<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { ref, useTemplateRef, watch } from 'vue'
import style from '@/assets/scss/base.module.scss'

interface Props {
  modelValue?: unknown
  value?: unknown
  trueValue?: unknown
  falseValue?: unknown
  indeterminate?: boolean
  disabled?: boolean
  hidden?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'checked', checked: boolean): void
}>()

const inputRef = useTemplateRef('inputRef')
const modelValue = useVModel(props, 'modelValue', emit)
const checked = ref(false)

function onChecked() {
  if (!inputRef.value) return
  checked.value = inputRef.value.checked
  emit('checked', checked.value)
}

watch(inputRef, onChecked)
watch(modelValue, onChecked, { flush: 'post', deep: true })
</script>

<template>
  <label :class="style.appCheckbox">
    <input
      ref="inputRef"
      v-model="modelValue"
      v-bind="{ value, trueValue, falseValue, indeterminate, disabled }"
      type="checkbox"
      :class="[
        style.appCheckboxInput,
        hidden && style.appCheckoxHidden,
        disabled && style.appCheckoxDisabled,
      ]"
    >
    <span v-if="$slots.default" :class="style.appCheckboxText">
      <slot />
    </span>
  </label>
</template>
