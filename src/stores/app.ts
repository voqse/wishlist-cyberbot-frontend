import type { Item, User, Wishlist } from '@/api/types'
import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, watch } from 'vue'
import {
  getWishlist,
  saveItems,
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

  const saveItemsDebounced = useDebounceFn(async () => {
    wishlist.value = await saveItems(wishlist.value.items)
  }, 5000)

  function createItem() {
    wishlist.value.items.push({
      text: '',
    } as Item)
    return saveItemsDebounced()
  }

  function removeItem(id: Item['id']) {
    const idx = wishlist.value.items.findIndex(item => item?.id === id)
    wishlist.value.items.splice(idx, 1)
    return saveItemsDebounced()
  }

  function moveItem(fromIndex: number, toIndex: number) {
    const items = wishlist.value.items
    if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
      return
    }

    // Move item from one position to another
    const [movedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, movedItem)
    return saveItemsDebounced()
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
    moveItem,
    saveItems: saveItemsDebounced,
    wishlist,
    wishlistCreatorUsername,
  }
})
