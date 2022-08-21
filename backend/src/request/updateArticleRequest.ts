/**
* Fields in a request to update a existing Article item.
*/
export interface UpdateArticleRequest {
    title: string
    description: string
    body: string
    tagList: string[]
}