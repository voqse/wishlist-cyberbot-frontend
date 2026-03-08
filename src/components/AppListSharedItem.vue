<script setup lang="ts">
import type { Item } from '@/api/types'
import { computed } from 'vue'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import { useAppStore } from '@/stores/app'
import { formatText, formatUsername } from '@/utils'

const props = defineProps<{
  item: Item
  disabled?: boolean
}>()

const appStore = useAppStore()

const isReserved = computed(() => Boolean(props.item.reservedBy))
</script>

<template>
  <li :class="style.appListItem">
    <AppCheckbox
      :class="style.appListItemCheckboxFullWidth"
      :model-value="isReserved"
      :disabled
      @update:model-value="$event ? appStore.reserveItem(item.id) : appStore.cancelReserveItem(item.id)"
    >
      <template #photo>
        <AppUserPhoto
          v-if="isReserved && item.reservedBy?.photoUrl"
          :src="item.reservedBy.photoUrl"
          :alt="`${item.reservedBy.username}'s photo`"
          :class="style.appCheckBoxPhoto"
        />
      </template>

      <template #default>
        <div :class="style.appListItemText" v-html="formatText(item.text)" />
        <div v-if="isReserved" :class="style.appListItemReserverUsername">
          {{ formatUsername(item.reservedBy!) }}
        </div>
      </template>
    </AppCheckbox>
  </li>
</template>
