import 'source-map-support/register'
import { Post } from '../entity/post'
import { PostRepository } from '../repository/post'
import { createLogger } from '../utils/logger'
import { CreatePostRequest } from '../models/createPostRequest'
import { v4 as uuidv4 } from 'uuid';
import { UpdatePostRequest } from '../models/updatePostRequest'
import { UserRepository } from '../repository/user'
import { emptyUser } from '../entity/user'

const logger = createLogger('postService')

const postRepo = new PostRepository()
const userRepo = new UserRepository()

export async function getposts(): Promise<Post[]> {
    logger.info("Retrieving all post")

    return await postRepo.findAll()
}

export async function getpostsByAuthor(author: string): Promise<Post[]> {
    logger.info(`Retrieving all post by ${author}`)

    return await postRepo.findByAuthor(author)
}


export async function getpostById(postId: string): Promise<Post> {
    logger.info(`Retrieving post ${postId}`)

    const item = await postRepo.findById(postId)
  
    if (!item) {
        logger.error(`post ${postId} not found`)
        throw new Error('Item not found')
    }
    
    var user = await userRepo.findByUsername(item.author)
    
    if (!user) {
        user = emptyUser()
    }

    return item
}

export async function createpost(username: string, request: CreatePostRequest): Promise<Post> {
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

export async function updatepost(username: string, postId: string, request: UpdatePostRequest): Promise<void> {

    logger.info(`Updating post ${postId} for user ${username}`, { username, postId, post: request })

    const item = await postRepo.findById(postId)
  
    if (!item) {
        logger.error(`post ${postId} not found`)
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

export async function deletepost(username: string, postId: string) {
    logger.info(`Deleting todo ${postId} for user ${username}`, { postId, username })
  
    const item = await postRepo.findById(postId)
  
    if (!item) {
        logger.error(`post ${postId} not found`)
        throw new Error('Item not found')
    }
  
    if (item.author !== username) {
      logger.error(`User ${username} does not have permission to delete post ${postId}`)
      throw new Error('User is not authorized to update item')
    }
  
    await postRepo.delete(postId)
  }
