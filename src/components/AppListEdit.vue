<script setup lang="ts">
import type { VueMessageType } from 'vue-i18n'
import type { Item } from '@/api/types'
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppListEditItem from '@/components/AppListEditItem.vue'
import { useAppStore } from '@/stores/app'
import { clamp, shuffleArray } from '@/utils'

const { t, tm, rt } = useI18n()

const appStore = useAppStore()

const itemRefs = useTemplateRef('itemRefs')
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const items = computed(() => appStore.wishlist.items)
const itemsCount = computed(() => items.value.length)
const placeholders = computed<string[]>(() =>
  shuffleArray(tm('common.placeholder').map((item: VueMessageType) => rt(item))))

async function handleRemove(id: Item['id'], idx: number) {
  if (itemsCount.value === 1) return
  void appStore.removeItem(id)
  await nextTick()
  itemRefs.value?.[clamp(idx - 1, 0, itemsCount.value)]?.focus()
}

function handleDragStart(event: DragEvent, index: number) {
  if (!event.dataTransfer) return
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', index.toString())

  // Add visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = '0.5'
}

function handleDragEnd(event: DragEvent) {
  draggedIndex.value = null
  dragOverIndex.value = null

  // Reset visual feedback
  const target = event.currentTarget as HTMLElement
  target.style.opacity = ''
}

function handleDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  if (!event.dataTransfer) return

  dragOverIndex.value = index
  event.dataTransfer.dropEffect = 'move'
}

function handleDragLeave(index: number) {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

function handleDrop(event: DragEvent, toIndex: number) {
  event.preventDefault()

  const fromIndexStr = event.dataTransfer?.getData('text/plain')
  if (!fromIndexStr) return

  const fromIndex = Number.parseInt(fromIndexStr, 10)
  if (Number.isNaN(fromIndex) || fromIndex === toIndex) return

  void appStore.moveItem(fromIndex, toIndex)
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <ul :class="[style.appList, style.appListEdit]">
    <AppListEditItem
      v-for="(item, index) in items"
      :key="item.id || index"
      ref="itemRefs"
      v-model="item.text"
      :placeholder="placeholders[index % placeholders.length]"
      :draggable="true"
      :class="{
        [style.appListEditItemDragging]: draggedIndex === index,
        [style.appListEditItemDragOver]: dragOverIndex === index && draggedIndex !== index,
      }"
      @update:model-value="appStore.saveItems"
      @remove="handleRemove(item.id, index)"
      @dragstart="handleDragStart($event, index)"
      @dragend="handleDragEnd"
      @dragover="handleDragOver($event, index)"
      @dragleave="handleDragLeave(index)"
      @drop="handleDrop($event, index)"
    />
  </ul>
  <div :class="style.appActionBar">
    <div :class="style.appActionBarBlur" />
    <div :class="style.appActionBarContent">
      <button :class="style.appActionBarButton" @click="appStore.createItem">
        {{ t('wishlist.newItem') }}
      </button>
    </div>
  </div>
</template>
