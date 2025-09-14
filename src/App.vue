<script setup lang="ts">
import type { Item, User, Wishlist } from '@/api/types'
import WebApp from '@twa-dev/sdk'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { auth, getWishlist, saveItems } from '@/api'
import style from '@/assets/scss/base.module.scss'
import AppUserPhoto from '@/components/AppUserPhoto.vue'
import AppWishlist from '@/components/AppWishlist.vue'
import AppWishlistItem from '@/components/AppWishlistItem.vue'
import { fadeVueTransitionProps } from '@/constants'

const { t } = useI18n()

const isReady = ref(false)

const shareId = ref(WebApp.initDataUnsafe.start_param)
const initData = ref(WebApp.initData || import.meta.env.VITE_INIT_DATA)

const currentUser = ref<User>({} as User)
const wishlist = ref<Wishlist>({
  items: [] as Item[],
  createdBy: {} as User,
} as Wishlist)

const isOwnWishlist = computed(() => wishlist.value.createdBy?.id === currentUser.value?.id)

const wishlistUserUsername = computed(() => wishlist.value
  ? wishlist.value.createdBy.firstName || wishlist.value.createdBy.username
  : 'Unauthorised')

const title = computed(() => wishlist.value
  ? `${wishlistUserUsername.value}'s wishlist`
  : 'New wishlist')

function addItem() {
  wishlist.value.items.push({
    text: '',
  } as Item)
}

function removeItem(id: Item['id']) {
  wishlist.value.items = wishlist.value.items.filter(item => item.id !== id)
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
  if (typeof import.meta.env.VITE_API_BASE === 'string') {
    currentUser.value = await auth(initData.value)
    wishlist.value = await getWishlist(shareId.value)
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
        </div>
      </div>
      <div :class="style.appPanel">
        <AppWishlist v-if="wishlist.items.length">
          <AppWishlistItem v-for="item in wishlist.items" :key="item.id" v-model="item.text" :is-own-wishlist @delete="removeItem(item.id)" />
        </AppWishlist>
        <template v-if="isOwnWishlist">
          <button :class="style.appListItemAction" @click="addItem">
            Add a new wish
          </button>
          <button :class="style.appListItemAction" @click="saveItems(wishlist.items)">
            Save
          </button>
          <button :class="style.appListItemAction" @click="shareWishlist">
            Share wishlist
          </button>
        </template>
      </div>
    </div>
  </Transition>
</template>
