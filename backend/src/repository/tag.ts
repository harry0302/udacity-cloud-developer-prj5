import 'source-map-support/register'
import { Tag } from '../models/tag'
import { client } from '../utils/dynamoDBClient'
import { createLogger } from '../utils/logger'

const logger = createLogger('TagRepository')

export class TagRepository {

    constructor(
        private readonly docClient = client,
        private readonly tagTable = process.env.TAGS_TABLE,
    ) { }

    async findAll(): Promise<Tag[]> {
        logger.info(`Getting all tag`)

        const result = await this.docClient.scan({
            TableName: this.tagTable,
            Limit: 100,
        }).promise();

        return result.Items as Tag[];
    }

    async existByName(name : string): Promise<boolean> {
        logger.info(`Checking exist tag by name ${name}`);

        const res = await this.docClient.get({
            TableName: this.tagTable,
            Key: {
                tagName: name,
            }
        }).promise();

        if (res.Item) {
            return true;
        }

        return false;
    }

    async create(tag: Tag): Promise<void> {
        logger.info(`Creating tag ${tag.tagName}`)

        await this.docClient.put({
            TableName: this.tagTable,
            Item: tag,
        }).promise()
    }
}