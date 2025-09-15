export interface User {
  id: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
  photoUrl?: string
  token: string
  // createdAt: number
  // updatedAt: number
}

export interface Item {
  id: number
  text: string
  links: string[]
  photos: string[]
  createdBy: User
  createdAt: number
  // updatedAt: number
  reservedBy: User | null
  reservedAt: number | null
}

export interface Wishlist {
  id: number
  shareId: string
  title: string
  items: Item[]
  createdBy: User
  createdAt: number
  // updatedAt: number
}
