import 'source-map-support/register'
import { Comment } from '../models/comment'
import { client } from '../utils/dynamoDBClient'
import { createLogger } from '../utils/logger'

const logger = createLogger('CommentRepository')

export class CommentRepository {

    constructor(
        private readonly docClient = client,
        private readonly commentTable = process.env.TODOS_TABLE,
        private readonly commentByCreatedAtIndex = process.env.TODOS_BY_USER_INDEX
    ) { }

    /**
    * Find all comment sort by createdAt
    * @returns Comment[]
    */
    async findByPostId(postId: string): Promise<Comment[]> {
        logger.info(`Getting all comment`)

        const result = await this.docClient.query({
            TableName: this.commentTable,
            IndexName: this.commentByCreatedAtIndex,
            ScanIndexForward: false,
            KeyConditionExpression: 'postId = :postId',
            ExpressionAttributeValues: {
                ':postId': postId
            }
        }).promise()

        const items = result.Items

        logger.info(`Found ${items.length} comment`)

        return items as Comment[]
    }

    /**
    * Create a new comment
    * @param comment data will store to db
    * @returns void
    */
    async create(comment: Comment) {
        logger.info(`Creating comment of ${comment.author} for post ${comment.postId}`)

        await this.docClient.put({
            TableName: this.commentTable,
            Item: comment,
        }).promise()
    }

    /**
    * Delete a exist comment
    * @param commentId id of comment will be delete
    * @returns void
    */
    async delete(commentId: string) {
        logger.info(`Deleting comment item ${commentId}`)

        await this.docClient.delete({
            TableName: this.commentTable,
            Key: { commentId: commentId}
        }).promise()
    }
}