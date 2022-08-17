import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import 'source-map-support/register';
import { Article } from '../models/article';
import { client } from '../utils/dynamoDBClient';
import { createLogger } from '../utils/logger';
import { findWithPagination } from './utils';

const logger = createLogger('ArticleRepository');

interface findAllParam {
    tag: string
    author: string
    favorited: string
    limit: number
    offset: number
}

export class ArticleRepository {

    constructor(
        private readonly docClient = client,
        private readonly articleTable = process.env.ARTICLES_TABLE,
        private readonly articleByUpdatedAtIndex = process.env.ARTICLES_BY_UPDATED_AT_INDEX,
        private readonly articleByAuthorIndex = process.env.ARTILCES_BY_AUTHOR_INDEX
    ) { }

    /**
    * Find all article
    * @returns article[]
    */
    async findAll(params: findAllParam): Promise<Article[]> {
        logger.info(`Getting all article`);

        const queryParams: DocumentClient.QueryInput = {
            TableName: this.articleTable,
            IndexName: this.articleByUpdatedAtIndex,
            ScanIndexForward: false,
            KeyConditionExpression: 'dummy = :dummy',
            ExpressionAttributeValues: {
                ':dummy': "OK",
            }
        };

        if (params.tag) {
            queryParams.FilterExpression = 'contains(tagList, :tag)';
            queryParams.ExpressionAttributeValues[':tag'] = params.tag;
        } else if (params.author) {
            queryParams.FilterExpression = 'author = :author';
            queryParams.ExpressionAttributeValues[':author'] = params.author;
        } else if (params.favorited) {
            queryParams.FilterExpression = 'contains(favoritedBy, :favorited)';
            queryParams.ExpressionAttributeValues[':favorited'] = params.favorited;
        }

        const result = await findWithPagination(this.docClient, queryParams, params.limit, params.offset);

        logger.info(`Found ${result.length} article`);

        return result as Article[];
    }

    /**
    * Find article by slug
    * @param slug will be find
    * @returns article
    */
    async findBySlug(slug: string): Promise<Article> {
        logger.info(`Getting article by slug ${slug}`);

        const result = await this.docClient.query({
            TableName: this.articleTable,
            IndexName: this.articleByAuthorIndex,
            ScanIndexForward: false,
            KeyConditionExpression: 'slug = :slug',
            ExpressionAttributeValues: {
                ':slug': slug
            }
        }).promise();

        if (result.Count == 0) {
            return null;
        }

        const item = result.Items[0];

        return item as Article;
    }

    /**
    * Create a new article
    * @param article data will store to db
    * @returns void
    */
    async create(article: Article): Promise<void> {
        logger.info(`Creating article ${article.slug}`)

        await this.docClient.put({
            TableName: this.articleTable,
            Item: article,
        }).promise()
    }

    /**
    * Update a exist article
    * @param article new data will be replace with exists at db
    * @returns void
    */
    async update(article: Article): Promise<void> {
        logger.info(`Updating article item ${article.slug}`)

        await this.docClient.put({
            TableName: this.articleTable,
            Item: article
        }).promise()
    }

    /**
    * Delete a exist article
    * @param slug of article will be delete
    * @returns void
    */
    async delete(slug: string): Promise<void> {
        logger.info(`Deleting article item ${slug}`)

        await this.docClient.delete({
            TableName: this.articleTable,
            Key: { slug: slug }
        }).promise()
    }

    async findTags(): Promise<string[]> {
        logger.info(`Getting all tags`)

        const uniqTags = {};

        let lastEvaluatedKey = null;
        do {
            const scanParams: DocumentClient.ScanInput = {
                TableName: this.articleTable,
                AttributesToGet: ['tagList'],
            };
            
            if (lastEvaluatedKey) {
                scanParams.ExclusiveStartKey = lastEvaluatedKey;
            }
            
            const data = await this.docClient.scan(scanParams).promise();
            const items = data.Items as Article[];
            items.forEach(item => {
                if (item.tagList && item.tagList.values) {
                    item.tagList.forEach(tag => uniqTags[tag] = 1);
                }
            });
            lastEvaluatedKey = data.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        const tags = Object.keys(uniqTags);

        return tags;
    }
}