<script setup lang="ts">
import type { Item } from '@/api/types'
import { itemReserve, itemReserveCancel } from '@/api'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import { formatUsername, linkify } from '@/utils'

defineProps<{
  item: Item
  disabled?: boolean
}>()
</script>

<template>
  <li :class="style.appListItem">
    <AppCheckbox
      :class="style.appListItemCheckboxFullWidth"
      :model-value="Boolean(item.reservedBy)"
      :disabled
      @update:model-value="$event ? itemReserve(item.id) : itemReserveCancel(item.id)"
    >
      <template #photo>
        <AppUserPhoto
          v-if="Boolean(item.reservedBy) && item.reservedBy?.photoUrl"
          :src="item.reservedBy.photoUrl"
          :alt="`${item.reservedBy.username}'s photo`"
          :class="style.appCheckBoxPhoto"
        />
      </template>
      <template #default>
        <div :class="style.appListItemText" v-html="linkify(item.text)" />
        <div v-if="Boolean(item.reservedBy)" :class="style.appListItemReserverUsername">
          {{ formatUsername(item.reservedBy!) }}
        </div>
      </template>
    </AppCheckbox>
  </li>
</template>
