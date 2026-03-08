import type { Item, User, Wishlist } from '@/api/types'
import { useDebounceFn } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref, watch } from 'vue'
import {
  getWishlist,
  itemReserve,
  itemReserveCancel,
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

  let tempIdCounter = -1

  const saveItemsDebounced = useDebounceFn(async () => {
    const serverWishlist = await saveItems(wishlist.value.items)
    // Merge server response: update ids and server-side fields while preserving local array reference
    serverWishlist.items.forEach((serverItem, idx) => {
      const localItem = wishlist.value.items[idx]
      if (localItem) {
        Object.assign(localItem, serverItem)
      }
    })
    // Sync wishlist-level fields (id, shareId, etc.) without replacing items array
    const { items: _, ...wishlistMeta } = serverWishlist
    Object.assign(wishlist.value, wishlistMeta)
  }, 5000)

  function createItem() {
    // Optimistic update: add item immediately with a temporary negative id
    wishlist.value.items.push({
      id: tempIdCounter--,
      text: '',
    } as Item)
    return saveItemsDebounced()
  }

  function removeItem(id: Item['id']) {
    const idx = wishlist.value.items.findIndex(item => item?.id === id)
    // Optimistic update: remove item immediately
    wishlist.value.items.splice(idx, 1)
    return saveItemsDebounced()
  }

  watch(() => wishlist.value.items.length, (itemsCount) => {
    if (itemsCount) return
    void createItem()
  })

  async function reserveItem(id: Item['id']) {
    const item = wishlist.value.items.find(i => i?.id === id)
    if (!item || !user.value) return
    // Optimistic update: set reservedBy to current user immediately
    item.reservedBy = user.value
    item.reservedAt = new Date().toISOString()
    try {
      const serverWishlist = await itemReserve(id)
      const serverItem = serverWishlist.items.find((i: Item) => i.id === id)
      if (serverItem) Object.assign(item, serverItem)
    }
    catch {
      // Rollback on error
      item.reservedBy = null
      item.reservedAt = null
    }
  }

  async function cancelReserveItem(id: Item['id']) {
    const item = wishlist.value.items.find(i => i?.id === id)
    if (!item) return
    const prevReservedBy = item.reservedBy
    const prevReservedAt = item.reservedAt
    // Optimistic update: clear reservation immediately
    item.reservedBy = null
    item.reservedAt = null
    try {
      const serverWishlist = await itemReserveCancel(id)
      const serverItem = serverWishlist.items.find((i: Item) => i.id === id)
      if (serverItem) Object.assign(item, serverItem)
    }
    catch {
      // Rollback on error
      item.reservedBy = prevReservedBy
      item.reservedAt = prevReservedAt
    }
  }

  return {
    init,
    user,
    userIsCreator,
    userDisplayName,
    createItem,
    removeItem,
    reserveItem,
    cancelReserveItem,
    saveItems: saveItemsDebounced,
    wishlist,
    wishlistCreatorUsername,
  }
})
