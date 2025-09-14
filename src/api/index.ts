import type { Item, User, Wishlist } from '@/api/types'

let token: string

function request<T = Record<string, unknown>>(path: string, method: string, body?: Record<string, unknown>): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const params: RequestInit = { method, headers }

  if (token) headers.Authorization = `Bearer ${token}`
  if (body) params.body = JSON.stringify(body)

  return fetch(import.meta.env.VITE_API_BASE + path, params)
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

export function saveItems(items: Partial<Item>[]) {
  return request('/wishlist/items', 'POST', { items })
}

export function reserveItem(itemId: Item['id']) {
  return request(`/wishlist/items/${itemId}/reserve`, 'POST')
}
