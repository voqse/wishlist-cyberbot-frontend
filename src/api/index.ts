import type { Item, User, Wishlist } from '@/api/types'
import { createWebSocket } from '@/api/utils'

let token: string

function request<T = Record<string, unknown>>(path: string, method: string, body?: Record<string, unknown>): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const params: RequestInit = { method, headers }

  if (token) headers.Authorization = `Bearer ${token}`
  if (body) params.body = JSON.stringify(body)

  return fetch(__API_BASE__ + path, params)
    .then(res => res.json())
}

export async function auth(initData: string): Promise<User> {
  const responseData = await request<User>('/auth/telegram', 'POST', { initData })
  token = responseData.token
  return responseData
}

export function getWishlist(shareId?: Wishlist['shareId']): Promise<Wishlist> {
  const path = shareId ? `/wishlist/${shareId}` : `/wishlist`
  return request<Wishlist>(path, 'GET')
}

export function saveItems(items: Partial<Item>[]): Promise<Wishlist> {
  return request('/wishlist/items', 'POST', { items })
}

export function itemReserve(itemId: Item['id']) {
  return request(`/wishlist/items/reserve/${itemId}`, 'POST', {})
}

export function itemReserveCancel(itemId: Item['id']) {
  return request(`/wishlist/items/reserve/cancel/${itemId}`, 'POST', {})
}

export function subscribeToWishlistUpdates(shareId: Wishlist['shareId']) {
  return createWebSocket<Wishlist>(`${__API_WS_BASE__}/wishlist/ws/${shareId}`)
}
