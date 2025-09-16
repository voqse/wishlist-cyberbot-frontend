type Timestamp = string

export interface User {
  id: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
  photoUrl?: string
  token: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Item {
  id: number
  text: string
  links: string[]
  photos: string[]
  createdBy: User
  createdAt: Timestamp
  updatedAt: Timestamp
  reservedBy: User | null
  reservedAt: Timestamp | null
  isReserved?: boolean
}

export interface Wishlist {
  id: number
  shareId: string
  title: string
  items: Item[]
  createdBy: User
  createdAt: Timestamp
  updatedAt: Timestamp
}
