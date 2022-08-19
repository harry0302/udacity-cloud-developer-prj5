export interface Article {
  slug: string
  title: string
  description: string
  body: string
  author: string
  tagList?: string[]
  createdAt?: number
  updatedAt?: number
}
