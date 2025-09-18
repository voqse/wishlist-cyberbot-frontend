<script setup lang="ts">
import type { VueMessageType } from 'vue-i18n'
import type { Item } from '@/api/types'
import { computed, nextTick, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppListEditItem from '@/components/AppListEditItem.vue'
import { useAppStore } from '@/stores/app'
import { clamp, shuffleArray } from '@/utils'

const { t, tm, rt } = useI18n()

const appStore = useAppStore()

const itemRefs = useTemplateRef('itemRefs')

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
</script>

<template>
  <ul :class="[style.appList, style.appListEdit]">
    <AppListEditItem
      v-for="(item, index) in items"
      :key="index"
      ref="itemRefs"
      v-model="item.text"
      :placeholder="placeholders[index % placeholders.length]"
      @update:model-value="appStore.saveItems"
      @remove="handleRemove(item.id, index)"
    />
  </ul>
  <button :class="style.appListAction" @click="appStore.createItem">
    {{ t('wishlist.newItem') }}
  </button>
</template>
