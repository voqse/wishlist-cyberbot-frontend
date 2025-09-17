<script setup lang="ts">
import { computed } from 'vue'
import style from '@/assets/scss/base.module.scss'
import AppListSharedItem from '@/components/AppListSharedItem.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const items = computed(() => appStore.wishlist.items.filter(w => Boolean(w.text)))
</script>

<template>
  <ul :class="[style.appList, style.appListShared]">
    <AppListSharedItem
      v-for="(item, index) in items"
      :key="index"
      :item
      :disabled="Boolean(item.reservedBy && item.reservedBy.id !== appStore.user!.id)"
    />
  </ul>
</template>
