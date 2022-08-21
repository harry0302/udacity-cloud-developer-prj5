import { Comment } from '../models/comment';
import { client } from '../utils/dynamoDBClient';
import { createLogger } from '../utils/logger';

const logger = createLogger('CommentRepository');

export class CommentRepository {

    constructor(
        private readonly docClient = client,
        private readonly commentTable = process.env.COMMENTS_TABLE,
        private readonly commentByArticleIndex = process.env.COMMENTS_BY_ARTICLE_INDEX
    ) { }

    async findBySlug(slug: string): Promise<Comment[]> {
        logger.info(`Getting comment by article slug ${slug}`);

        const result = await this.docClient.query({
            TableName: this.commentTable,
            IndexName: this.commentByArticleIndex,
            ScanIndexForward: true,
            KeyConditionExpression: 'slug = :slug',
            ExpressionAttributeValues: {
                ':slug': slug,
            }
        }).promise();

        const item = result.Items;

        return item as Comment[];
    }

    async findById(id: string): Promise<Comment> {
        logger.info(`Getting comment by id ${id}`);

        const result = await this.docClient.get({
            TableName: this.commentTable,
            Key: {
                commentId: id,
            }
        }).promise();

        const item = result.Item;

        return item as Comment;
    }

    async create(comment: Comment): Promise<void> {
        logger.info(`Creating comment`, {comment})

        await this.docClient.put({
            TableName: this.commentTable,
            Item: comment,
        }).promise()
    }

    async delete(id: string): Promise<void> {
        logger.info(`Deleting article item ${id}`)

        await this.docClient.delete({
            TableName: this.commentTable,
            Key: { commentId: id }
        }).promise()
    }
}