import type { User, Wishlist } from '@/api/types'

export const FAKE_USER: User = {
  id: 123456789,
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  language_code: 'en',
  is_premium: true,
  photo_url: 'https://example.com/photo.jpg',
}

export const FAKE_WISHLIST: Wishlist = {
  id: 1,
  title: `${FAKE_USER.username}'s wishlist`,
  items: [
    {
      id: 1,
      text: 'Кофемашина',
      links: [],
      photos: [],
      createdBy: FAKE_USER.id,
      createdAt: 'string',
      // reservedBy: User['id']
      // reservedAt: string
    },
    {
      id: 2,
      text: 'Лабубу',
      links: [],
      photos: [],
      createdBy: FAKE_USER.id,
      createdAt: 'string',
      // reservedBy: User['id']
      // reservedAt: string
    },
    {
      id: 3,
      text: 'Триммер для жопы',
      links: [],
      photos: [],
      createdBy: FAKE_USER.id,
      createdAt: 'string',
      // reservedBy: User['id']
      // reservedAt: string
    },
  ],
  createdBy: FAKE_USER.id,
  createdAt: '14.09.2025',
}
