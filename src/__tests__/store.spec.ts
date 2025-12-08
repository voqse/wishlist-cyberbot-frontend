import type { Item, User, Wishlist } from '../api/types'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../stores/app'

// Mock the API module
vi.mock('../api', () => ({
  getWishlist: vi.fn(),
  saveItems: vi.fn(),
  subscribeToWishlistUpdates: vi.fn(() => ({
    onMessage: vi.fn(() => ({ close: vi.fn() })),
    close: vi.fn(),
  })),
}))

// Mock the i18n module
vi.mock('../i18n', () => ({
  setLocale: vi.fn(),
}))

describe('app Store - moveItem functionality', () => {
  let store: ReturnType<typeof useAppStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAppStore()

    // Set up initial state with mock data
    const mockUser: User = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      token: 'test-token',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    }

    const mockItems: Item[] = [
      {
        id: 1,
        text: 'First item',
        links: [],
        photos: [],
        createdBy: mockUser,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        reservedBy: null,
        reservedAt: null,
      },
      {
        id: 2,
        text: 'Second item',
        links: [],
        photos: [],
        createdBy: mockUser,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        reservedBy: null,
        reservedAt: null,
      },
      {
        id: 3,
        text: 'Third item',
        links: [],
        photos: [],
        createdBy: mockUser,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        reservedBy: null,
        reservedAt: null,
      },
    ]

    const mockWishlist: Wishlist = {
      id: 1,
      shareId: 'test-share-id',
      title: 'Test Wishlist',
      items: mockItems,
      createdBy: mockUser,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    }

    store.user = mockUser
    store.wishlist = mockWishlist
  })

  it('moves item from first position to last position', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Move first item (index 0) to last position (index 2)
    store.moveItem(0, 2)

    const newOrder = store.wishlist.items.map(item => item.text)
    expect(newOrder).toEqual(['Second item', 'Third item', 'First item'])
  })

  it('moves item from last position to first position', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Move last item (index 2) to first position (index 0)
    store.moveItem(2, 0)

    const newOrder = store.wishlist.items.map(item => item.text)
    expect(newOrder).toEqual(['Third item', 'First item', 'Second item'])
  })

  it('moves item to adjacent position', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Move second item (index 1) to first position (index 0)
    store.moveItem(1, 0)

    const newOrder = store.wishlist.items.map(item => item.text)
    expect(newOrder).toEqual(['Second item', 'First item', 'Third item'])
  })

  it('does nothing when moving to the same position', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Move first item to its current position
    store.moveItem(0, 0)

    const orderAfterMove = store.wishlist.items.map(item => item.text)
    expect(orderAfterMove).toEqual(['First item', 'Second item', 'Third item'])
  })

  it('handles invalid fromIndex gracefully', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Try to move from invalid negative index
    store.moveItem(-1, 1)
    let orderAfterMove = store.wishlist.items.map(item => item.text)
    expect(orderAfterMove).toEqual(['First item', 'Second item', 'Third item'])

    // Try to move from index beyond array length
    store.moveItem(5, 1)
    orderAfterMove = store.wishlist.items.map(item => item.text)
    expect(orderAfterMove).toEqual(['First item', 'Second item', 'Third item'])
  })

  it('handles invalid toIndex gracefully', () => {
    const initialOrder = store.wishlist.items.map(item => item.text)
    expect(initialOrder).toEqual(['First item', 'Second item', 'Third item'])

    // Try to move to invalid negative index
    store.moveItem(0, -1)
    let orderAfterMove = store.wishlist.items.map(item => item.text)
    expect(orderAfterMove).toEqual(['First item', 'Second item', 'Third item'])

    // Try to move to index beyond array length
    store.moveItem(0, 5)
    orderAfterMove = store.wishlist.items.map(item => item.text)
    expect(orderAfterMove).toEqual(['First item', 'Second item', 'Third item'])
  })
})
