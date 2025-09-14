import type { WebAppUser } from '@twa-dev/types'

export interface User extends WebAppUser {}

export interface Item {
  id: number
  text: string
  links?: string[]
  photos?: string[]
  createdBy: User['id']
  createdAt: string
  reservedBy?: User['id']
  reservedAt?: string
}

export interface Wishlist {
  id: number
  title: string
  items: Item[]
  createdBy: User['id']
  createdAt: string
}
