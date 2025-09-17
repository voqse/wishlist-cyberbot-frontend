<script setup lang="ts">
import { computed } from 'vue'
import { itemReserve, itemReserveCancel } from '@/api'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import { useAppStore } from '@/stores/app'
import { formatUsername } from '@/utils'

const appStore = useAppStore()

const items = computed(() => appStore.wishlist.items.filter(w => Boolean(w.text)))
</script>

<template>
  <ul :class="[style.appList, style.appListShared]">
    <li v-for="(item, index) in items" :key="index" :class="style.appListItem">
      <AppCheckbox
        :class="style.appListItemCheckboxFullWidth"
        :model-value="Boolean(item.reservedBy)"
        :disabled="Boolean(item.reservedBy && item.reservedBy.id !== appStore.user!.id)"
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
          <div :class="style.appListItemText">
            {{ item.text }}
          </div>
          <div v-if="Boolean(item.reservedBy)" :class="style.appListItemReserverUsername">
            {{ formatUsername(item.reservedBy!) }}
          </div>
        </template>
      </AppCheckbox>
    </li>
  </ul>
</template>
