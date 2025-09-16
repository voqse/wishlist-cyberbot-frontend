<script setup lang="ts">
import type { VueMessageType } from 'vue-i18n'
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
import { setLocale } from '@/i18n.ts'

const { t, tm, rt } = useI18n()

const isReady = ref(false)

const initData = ref(WebApp.initData || __DEV_INIT_DATA__)
const shareId = ref(WebApp.initDataUnsafe.start_param || __DEV_START_PARAM__)

const currentUser = ref<User>()
const wishlist = ref<Wishlist>({
  items: [] as Item[],
} as Wishlist)

const isOwner = computed(() => wishlist.value.createdBy?.id === currentUser.value?.id)

const wishlistUserUsername = computed(() => wishlist.value
  ? formatUsername(wishlist.value.createdBy)
  : 'Unauthorised')

const placeholders = computed<string[]>(() =>
  tm('common.placeholder').map((item: VueMessageType) => rt(item)))

function formatUsername(user: User) {
  return [
    user.firstName,
    user.lastName,
  ].filter(Boolean).join(' ') || `@${user.username}`
}

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
  const appUrl = `https://t.me/${__TG_BOT_NAME__}?startapp=${wishlist.value.shareId}`
  const shareUrl = new URL('https://t.me/share/url')
  shareUrl.searchParams.set('url', appUrl)

  WebApp.openTelegramLink(shareUrl.toString())
}

function createOwnWishlist() {
  WebApp.openTelegramLink(`https://t.me/${__TG_BOT_NAME__}?startapp`)
}

watchEffect(() => {
  if (wishlist.value.items.length) return
  addItem()
})

onMounted(async () => {
  if (typeof __API_BASE__ === 'string') {
    currentUser.value = await auth(initData.value)
    wishlist.value = await getWishlist(shareId.value)

    setLocale(currentUser.value.languageCode)

    if (!isOwner.value && shareId.value) {
      const { data } = useWebSocket(`${__API_WS_BASE__}/wishlist/ws/${shareId.value}`, { autoReconnect: true })

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
          <AppUserPhoto
            v-if="wishlist.createdBy?.photoUrl"
            :src="wishlist.createdBy.photoUrl"
            :alt="`${wishlistUserUsername}'s photo`"
            :class="style.appTitlePhoto"
          />
          <div :class="style.appTitleText">
            {{ wishlistUserUsername }}
          </div>
          <button :class="style.appTitleAction" @click="shareWishlist">
            {{ t('common.share') }}
          </button>
        </div>
      </div>

      <div :class="style.appPanel">
        <ul v-if="wishlist.items.length" :class="style.appList">
          <li v-for="item in wishlist.items" :key="item.id" :class="style.appListItem">
            <template v-if="isOwner">
              <AppCheckbox disabled />
              <input v-model="item.text" placeholder="Item" type="text" :class="style.appListInput" @input="saveItems">
              <button :class="style.appListItemAction" @click="removeItem(item.id)">
                {{ t('common.remove') }}
              </button>
            </template>

            <template v-else>
              <AppCheckbox
                :class="style.appListItemCheckboxFullWidth"
                :model-value="Boolean(item.reservedBy)"
                :disabled="Boolean(item.reservedBy && item.reservedBy.id !== currentUser!.id)"
                @update:model-value="reserveItem(item.id, $event as boolean)"
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
            </template>
          </li>
        </ul>

        <template v-if="isOwner">
          <button :class="style.appListAction" @click="addItem">
            {{ t('wishlist.newItem') }}
          </button>
        </template>
      </div>

      <div v-if="!isOwner" :class="style.appPanel">
        <button :class="style.appListAction" @click="createOwnWishlist">
          {{ t('wishlist.newList') }}
        </button>
      </div>
    </div>
  </Transition>
</template>
