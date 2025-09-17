<script setup lang="ts">
import type { VueMessageType } from 'vue-i18n'
import type { Item } from '@/api/types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import style from '@/assets/scss/base.module.scss'
import AppListEditItem from '@/components/AppListEditItem.vue'
import { useAppStore } from '@/stores/app.ts'
import { shuffleArray } from '@/utils'

defineProps<{
  items: Item[]
}>()

const { t, tm, rt } = useI18n()

const appStore = useAppStore()

const placeholders = computed<string[]>(() =>
  shuffleArray(tm('common.placeholder').map((item: VueMessageType) => rt(item))))
</script>

<template>
  <ul :class="[style.appList, style.appListEdit]">
    <AppListEditItem
      v-for="(item, index) in items"
      :key="index"
      v-model="item.text"
      :placeholder="placeholders[index % placeholders.length]"
      :class="style.appListItem"
      @update:model-value="appStore.saveItems"
      @remove="appStore.removeItem(item.id)"
    />
  </ul>
  <button :class="style.appListAction" @click="appStore.createItem">
    {{ t('wishlist.newItem') }}
  </button>
</template>
