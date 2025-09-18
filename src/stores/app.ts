import type { Item, User, Wishlist } from '@/api/types'
import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, watch } from 'vue'
import {
  getWishlist,
  saveItems as saveItemsRequest,
  subscribeToWishlistUpdates,
} from '@/api'
import { setLocale } from '@/i18n'
import { formatUsername } from '@/utils'

export const useAppStore = defineStore('app', () => {
  const user = ref<User>()
  const wishlist = ref<Wishlist>({
    items: [] as Item[],
  } as Wishlist)

  const userIsCreator = computed(() => wishlist.value.createdBy?.id === user.value?.id)
  const userDisplayName = computed(() => formatUsername(wishlist.value.createdBy))
  const wishlistCreatorUsername = computed(() => formatUsername(wishlist.value.createdBy))

  async function init(initUser: User, shareId: string) {
    user.value = initUser
    wishlist.value = await getWishlist(shareId)
    setLocale(user.value.languageCode)

    if (userIsCreator.value || !shareId) return
    const ws = subscribeToWishlistUpdates(shareId)
      .onMessage(value => wishlist.value = value)
    onScopeDispose(() => ws.close(), true)
  }

  const saveItemsImmediate = async () => {
    wishlist.value = await saveItemsRequest(wishlist.value.items)
  }

  const saveItems = useDebounceFn(saveItemsImmediate, 5000)

  function createItem() {
    wishlist.value.items.push({
      text: '',
    } as Item)
    return saveItemsImmediate()
  }

  function removeItem(id: Item['id']) {
    wishlist.value.items = wishlist.value.items.filter(item => item?.id !== id)
    return saveItemsImmediate()
  }

  watch(() => wishlist.value.items.length, (itemsCount) => {
    if (itemsCount) return
    void createItem()
  })

  return {
    init,
    user,
    userIsCreator,
    userDisplayName,
    createItem,
    removeItem,
    saveItems,
    wishlist,
    wishlistCreatorUsername,
  }
})
