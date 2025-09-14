export interface User {
  id: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
  photoUrl?: string
  token: string
}

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
  shareId: string
  title: string
  items: Item[]
  createdBy: User['id']
  createdAt: string
}
