import 'source-map-support/register'
import { Post } from '../models/post'
import { PostRepository } from '../dataLayer/post'
import { createLogger } from '../utils/logger'
import { CreatePostRequest } from '../request/createPostRequest'
import { v4 as uuidv4 } from 'uuid';
import { UpdatePostRequest } from '../request/updatePostRequest'
import { ErrorREST, Errors } from '../utils/error'
import { S3Storage } from '../dataLayer/s3Storage'

const logger = createLogger('postService')

const postRepo = new PostRepository()
const storage = new S3Storage()

export async function getPosts(): Promise<Post[]> {
    logger.info("Retrieving all post");
    const items = await postRepo.findAll(); 
    items.map((item) => {
        if (item.url) {
          item.url = storage.getGetSignedUrl(item.url);
        }
    });

    return items
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
    logger.info(`Retrieving all post by ${userId}`);
    const items = await postRepo.findByUserId(userId);
    items.map((item) => {
        if (item.url) {
          item.url = storage.getGetSignedUrl(item.url);
        }
    });

    return items
}


export async function getPostById(postId: string): Promise<Post> {
    logger.info(`Retrieving post ${postId}`);

    const item =  await postRepo.findById(postId);
    item.url = storage.getGetSignedUrl(item.url);

    return item
}

export function generateUploadUrl(filename: string): string {
    logger.info(`Starting generateUploadUrl for ${filename}`);

    return storage.getPutSignedUrl(filename);
}

export async function createPost(userId: string, request: CreatePostRequest): Promise<Post> {
    const postId = uuidv4();
    const now = new Date().toISOString();

    const newItem: Post = {
        postId: postId,
        userId: userId,
        createdAt: now,
        updatedAt: now,
        ...request,
    };

    logger.info(`Creating post ${postId} for user ${userId}`, { userId, postId, post: newItem });

    await postRepo.create(newItem);

    newItem.url = storage.getGetSignedUrl(newItem.url)

    return newItem;
}

export async function updatePost(userId: string, postId: string, request: UpdatePostRequest): Promise<void> {

    logger.info(`Updating post ${postId} for user ${userId}`, { userId, postId, post: request });

    const item = await getPostById(postId);
  
    if (!item) {
        logger.error(`Post ${postId} not found`);
        throw new ErrorREST(Errors.BadRequest, 'Item not found');
    }
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update post ${postId}`);
      throw new ErrorREST(Errors.Forbidden, 'User is not authorized to update item');
    }
  
    await postRepo.update({
        postId: postId,
        ...request
    } as Post);
}

export async function deletePost(userId: string, postId: string) {
    logger.info(`Deleting todo ${postId} for user ${userId}`, { postId, userId });
  
    const item = await getPostById(postId);

    if (!item) {
        logger.error(`Post ${postId} not found`);
        throw new ErrorREST(Errors.BadRequest, 'Item not found');
    }
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to delete post ${postId}`);
      throw new ErrorREST(Errors.Forbidden, 'User is not authorized to update item');
    }
  
    await postRepo.delete(postId);
  }
