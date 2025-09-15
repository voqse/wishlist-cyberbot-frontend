<script setup lang="ts">
import type { Item, User, Wishlist } from '@/api/types'
import WebApp from '@twa-dev/sdk'
import { useDebounceFn, useWebSocket, whenever } from '@vueuse/core'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  auth,
  getWishlist,
  itemReserve,
  itemReserveCancel,
  saveItems as saveItemsRequest,
} from '@/api'
import style from '@/assets/scss/base.module.scss'
import AppCheckbox from '@/components/AppCheckbox.vue'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import { fadeVueTransitionProps } from '@/constants'

const { t } = useI18n()

const isReady = ref(false)

const initData = ref(WebApp.initData || __DEV_INIT_DATA__)
const shareId = ref(WebApp.initDataUnsafe.start_param || __DEV_START_PARAM__)

const currentUser = ref<User>()
const wishlist = ref<Wishlist>({
  items: [] as Item[],
} as Wishlist)

const isOwner = computed(() => wishlist.value.createdBy?.id === currentUser.value?.id)

const wishlistUserUsername = computed(() => wishlist.value
  ? wishlist.value.createdBy.firstName || wishlist.value.createdBy.username
  : 'Unauthorised')

const title = computed(() => wishlist.value
  ? `${wishlistUserUsername.value}'s wishlist`
  : 'New wishlist')

const saveItems = useDebounceFn(() => saveItemsRequest(wishlist.value.items), 1000)

function addItem() {
  wishlist.value.items.push({
    text: '',
  } as Item)
}

function removeItem(id: Item['id']) {
  wishlist.value.items = wishlist.value.items.filter(item => item.id !== id)
  saveItems()
}

function reserveItem(id: Item['id'], reserve: boolean) {
  reserve
    ? itemReserve(id)
    : itemReserveCancel(id)
}

function shareWishlist() {
  const appUrl = `https://t.me/GiftListRobot?startapp=${wishlist.value.shareId}`
  const shareUrl = new URL('https://t.me/share/url')
  shareUrl.searchParams.set('url', appUrl)

  WebApp.openTelegramLink(shareUrl.toString())
}

watchEffect(() => {
  if (wishlist.value.items.length) return
  addItem()
})

onMounted(async () => {
  if (typeof __API_BASE__ === 'string') {
    currentUser.value = await auth(initData.value)
    wishlist.value = await getWishlist(shareId.value)

    if (!isOwner.value && shareId.value) {
      const { data } = useWebSocket(`${__API_WS_BASE__}/wishlist/ws/${shareId.value}`)

      whenever(data, () => {
        try {
          wishlist.value = JSON.parse(data.value)
        }
        catch {
          console.warn('Unable to parse ws message:', data.value)
        }
      })
    }
  }

  // This is a temporary workaround for a blank screen issue on initial load on Android.
  isReady.value = true
})
</script>

<template>
  <Transition v-bind="fadeVueTransitionProps">
    <div v-if="isReady" :class="style.appLayout">
      <div :class="style.appPanel">
        <div :class="style.appTitle">
          <AppUserPhoto v-if="wishlist.createdBy?.photoUrl" :src="wishlist.createdBy.photoUrl" :alt="`${wishlistUserUsername}'s photo`" />
          <div :class="style.appTitleText">
            {{ title }}
          </div>
          <div v-if="isOwner">
            <button :class="style.appListItemAction" @click="shareWishlist">
              Share
            </button>
          </div>
        </div>
      </div>

      <div :class="style.appPanel">
        <ul v-if="wishlist.items.length" :class="style.appList">
          <li v-for="item in wishlist.items" :key="item.id" :class="style.appListItem">
            <template v-if="isOwner">
              <AppCheckbox disabled />
              <input v-model="item.text" placeholder="Item" type="text" :class="style.appListInput" @input="saveItems">
              <button v-if="isOwner" @click="removeItem(item.id)">
                Delete
              </button>
            </template>

            <template v-else>
              <AppCheckbox
                :class="style.appListItemCheckboxFullWidth"
                :model-value="Boolean(item.reservedBy)"
                @update:model-value="reserveItem(item.id, $event as boolean)"
              >
                {{ item.text }}
              </AppCheckbox>
            </template>
          </li>
        </ul>

        <template v-if="isOwner">
          <button :class="style.appListItemAction" @click="addItem">
            Add a new wish
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>
