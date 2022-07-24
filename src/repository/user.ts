import 'source-map-support/register'
import { User } from '../entity/user'
import { client } from '../utils/dynamoDBClient'
import { createLogger } from '../utils/logger'

const logger = createLogger('UserRepository')

export class UserRepository {

    constructor(
        private readonly docClient = client,
        private readonly userTable = process.env.TODOS_TABLE,
        private readonly userByEmailIndex = process.env.TODOS_BY_USER_INDEX
    ) { }

    /**
    * Find a user by username
    * @param username string
    * @returns a user
    */
    async findByUsername(username: string): Promise<User> {
        logger.info(`Getting user by username ${username}`)

        const result = await this.docClient.get({
            TableName: this.userTable,
            Key: { username: username }
        }).promise()

        const item = result.Item

        return item as User
    }

    /**
    * Check user exists by email
    * @param email string
    * @returns boolean
    */
    async existsByEmail(email: string): Promise<boolean> {
        logger.info(`Checking exists user by email ${email}`)

        const result = await this.docClient.query({
            TableName: this.userTable,
            IndexName: this.userByEmailIndex,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        }).promise()

        return result.Count != 0
    }

    /**
    * Find a user by email
    * @param email string
    * @returns a user
    */
    async findByEmail(email: string): Promise<User> {
        logger.info(`Getting user by email ${email}`)

        const result = await this.docClient.query({
            TableName: this.userTable,
            IndexName: this.userByEmailIndex,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        }).promise()

        if (result.Count == 0) {
            return null
        }

        const item = result.Items[0]

        return item as User
    }

    /**
    * Create a new user
    * @param user data will store to db
    * @returns void
    */
    async create(user: User) {
        logger.info(`Creating user ${user.username}`)

        await this.docClient.put({
            TableName: this.userTable,
            Item: user,
        }).promise()
    }

    /**
    * Update a exist user
    * @param user new data will be replace with exists at db
    * @returns void
    */
    async update(user: User) {
        logger.info(`Updating user item ${user.username}`)

        await this.docClient.update({
            TableName: this.userTable,
            Key: { username: user.username },
            UpdateExpression: 'set displayName = :displayName, passwordHash = :passwordHash, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ":displayName": user.displayName,
                ":passwordHash": user.passwordHash,
                ":updatedAt": new Date().toISOString()
            }
        }).promise()
    }
}