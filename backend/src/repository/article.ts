import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import 'source-map-support/register';
import { Article } from '../models/article';
import { client } from '../utils/dynamoDBClient';
import { createLogger } from '../utils/logger';
import { queryAll } from './utils';

const logger = createLogger('ArticleRepository');

interface findAllParam {
    tag: string
    author: string
    favorited: string
}

export class ArticleRepository {

    constructor(
        private readonly docClient = client,
        private readonly articleTable = process.env.ARTICLES_TABLE,
        private readonly articleByUpdatedAtIndex = process.env.ARTICLES_BY_UPDATED_AT_INDEX,
        private readonly articleByAuthorIndex = process.env.ARTICLES_BY_AUTHOR_INDEX
    ) { }

    /**
    * Find all article
    * @returns article[]
    */
    async findAll(params: findAllParam): Promise<Article[]> {
        logger.info(`Getting all article`, { params });

        if (params.author) {
            return await this.findByAuthor(params.author);
        }

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
        } else if (params.favorited) {
            queryParams.FilterExpression = 'contains(favoritedBy, :favorited)';
            queryParams.ExpressionAttributeValues[':favorited'] = params.favorited;
        }

        const result = await queryAll<Article>(this.docClient, queryParams);

        logger.info(`Found ${result.length} article`);

        return result;
    }

    async findByAuthor(author: string): Promise<Article[]> {
        const result = await queryAll<Article>(this.docClient, {
            TableName: this.articleTable,
            IndexName: this.articleByAuthorIndex,
            ScanIndexForward: false,
            KeyConditionExpression: 'author = :author',
            ExpressionAttributeValues: {
                ':author': author,
            }
        });

        logger.info(`Found ${result.length} article`);

        return result;
    }

    async findByAuthorIn(authorList: string[]): Promise<Article[]> {
        const queryParams: DocumentClient.QueryInput = {
            TableName: this.articleTable,
            IndexName: this.articleByUpdatedAtIndex,
            KeyConditionExpression: 'dummy = :dummy',
            FilterExpression: 'author IN ',
            ExpressionAttributeValues: {
                ':dummy': 'OK',
            },
            ScanIndexForward: false,
        }

        for (let i = 0; i < authorList.length; ++i) {
            queryParams.ExpressionAttributeValues[`:author${i}`] = authorList[i];
        }

        queryParams.FilterExpression += '(' +
            Object.keys(queryParams.ExpressionAttributeValues)
                .filter(e => e !== ':dummy').join(",") +
            ')';

        const result = await queryAll<Article>(this.docClient, queryParams);

        logger.info(`Found ${result.length} article`);

        return result;
    }

    /**
    * Find article by slug
    * @param slug will be find
    * @returns article
    */
    async findBySlug(slug: string): Promise<Article> {
        logger.info(`Getting article by slug ${slug}`);

        const result = await this.docClient.get({
            TableName: this.articleTable,
            Key: {
                slug: slug,
            }
        }).promise();

        const item = result.Item;

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
}