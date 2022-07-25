import 'source-map-support/register'
import { Post } from '../entity/post'
import { PostRepository } from '../repository/post'
import { createLogger } from '../utils/logger'
import { CreatePostRequest } from '../models/createPostRequest'
import { v4 as uuidv4 } from 'uuid';
import { UpdatePostRequest } from '../models/updatePostRequest'

const logger = createLogger('postService')

const postRepo = new PostRepository()

export async function getPosts(): Promise<Post[]> {
    logger.info("Retrieving all post")

    return await postRepo.findAll()
}

export async function getPostsByAuthor(author: string): Promise<Post[]> {
    logger.info(`Retrieving all post by ${author}`)

    return await postRepo.findByAuthor(author)
}


export async function getPostById(postId: string): Promise<Post> {
    logger.info(`Retrieving post ${postId}`)

    return await postRepo.findById(postId)
}

export async function createPost(username: string, request: CreatePostRequest): Promise<Post> {
    const postId = uuidv4()
    const now = new Date().toISOString()

    const newItem: Post = {
        postId: postId,
        hearts: [],
        author: username,
        createdAt: now,
        updatedAt: now,
        ...request,
    }

    logger.info(`Creating post ${postId} for user ${username}`, { username, postId, post: newItem })

    await postRepo.create(newItem)

    return newItem
}

export async function updatePost(username: string, postId: string, request: UpdatePostRequest): Promise<void> {

    logger.info(`Updating post ${postId} for user ${username}`, { username, postId, post: request })

    const item = await getPostById(postId)
  
    if (!item) {
        logger.error(`Post ${postId} not found`)
        throw new Error('Item not found')
    }
  
    if (item.author !== username) {
      logger.error(`User ${username} does not have permission to update post ${postId}`)
      throw new Error('User is not authorized to update item')
    }
  
    await postRepo.update({
        postId: postId,
        ...request
    } as Post)
}

export async function deletePost(username: string, postId: string) {
    logger.info(`Deleting todo ${postId} for user ${username}`, { postId, username })
  
    const item = await getPostById(postId)
  
    if (!item) {
        logger.error(`Post ${postId} not found`)
        throw new Error('Item not found')
    }
  
    if (item.author !== username) {
      logger.error(`User ${username} does not have permission to delete post ${postId}`)
      throw new Error('User is not authorized to update item')
    }
  
    await postRepo.delete(postId)
  }
