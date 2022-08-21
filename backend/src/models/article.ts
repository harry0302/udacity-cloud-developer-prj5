export interface Article {
  slug: string
  title: string
  description: string
  body: string
  author: string
  tagList?: string[]
  favoritedBy: string[]
  favoritesCount: number
  createdAt?: number
  updatedAt?: number
  dummy: string
}
