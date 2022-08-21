/**
* Fields in a request to create a single Article item.
*/
export interface CreateArticleRequest {
    title: string
    description: string
    body: string
    tagList: string[]
}