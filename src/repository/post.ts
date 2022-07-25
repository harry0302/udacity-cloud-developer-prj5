import 'source-map-support/register'
import { Post } from '../entity/post'
import { client } from '../utils/dynamoDBClient'
import { createLogger } from '../utils/logger'

const logger = createLogger('PostRepository')

export class PostRepository {

    constructor(
        private readonly docClient = client,
        private readonly postTable = process.env.TODOS_TABLE,
        private readonly postByUpdatedAtIndex = process.env.TODOS_BY_USER_INDEX,
        private readonly postByUserIndex = process.env.TODOS_BY_USER_INDEX
    ) { }

    /**
    * Find all post
    * @returns post[]
    */
    async findAll(): Promise<Post[]> {
        logger.info(`Getting all post`)

        const result = await this.docClient.query({
            TableName: this.postTable,
            IndexName: this.postByUpdatedAtIndex,
            ScanIndexForward: false
        }).promise()

        const items = result.Items

        logger.info(`Found ${items.length} post`)

        return items as Post[]
    }

    /**
    * Find all post by author
    * @param author will be find
    * @returns post[]
    */
     async findByAuthor(author: string): Promise<Post[]> {
        logger.info(`Getting all post by author ${author}`)

        const result = await this.docClient.query({
            TableName: this.postTable,
            IndexName: this.postByUserIndex,
            ScanIndexForward: false,
            KeyConditionExpression: 'author = :author',
            ExpressionAttributeValues: {
                ':author': author
            }
        }).promise()

        const items = result.Items

        logger.info(`Found ${items.length} post by author ${author}`)

        return items as Post[]
    }

    /**
    * Find post by slug
    * @param postId will be find
    * @returns post
    */
     async findById(postId: string): Promise<Post> {
        logger.info(`Getting post by postId ${postId}`)

        const result = await this.docClient.get({
            TableName: this.postTable,
            Key: { postId: postId }
        }).promise()

        const item = result.Item

        return item as Post
    }

    /**
    * Create a new post
    * @param post data will store to db
    * @returns void
    */
    async create(post: Post): Promise<void> {
        logger.info(`Creating post ${post.postId}`)

        await this.docClient.put({
            TableName: this.postTable,
            Item: post,
        }).promise()
    }

    /**
    * Update a exist post
    * @param post new data will be replace with exists at db
    * @returns void
    */
    async update(post: Post): Promise<void> {
        logger.info(`Updating post item ${post.postId}`)

        await this.docClient.update({
            TableName: this.postTable,
            Key: { postId: post.postId },
            UpdateExpression: 'set title = :title, description = :description, image = :image, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ":title": post.title,
                ":description": post.description,
                ":image": post.image,
                ":updatedAt": new Date().toISOString()
            }
        }).promise()
    }

    /**
    * Delete a exist post
    * @param postId of post will be delete
    * @returns void
    */
    async delete(postId: string): Promise<void> {
        logger.info(`Deleting post item ${postId}`)

        await this.docClient.delete({
            TableName: this.postTable,
            Key: { postId: postId}
        }).promise()
    }
}