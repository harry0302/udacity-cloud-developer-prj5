import 'source-map-support/register'
import { User } from '../models/user'
import { client } from '../utils/dynamoDBClient'
import { createLogger } from '../utils/logger'

const logger = createLogger('UserRepository')

export class UserRepository {

    constructor(
        private readonly docClient = client,
        private readonly userTable = process.env.USERS_TABLE,
        private readonly userByEmailIndex = process.env.USERS_BY_EMAIL_INDEX,
        private readonly userUsernameIndex = process.env.USERS_BY_USERNAME_INDEX
    ) { }

    /**
    * Find a user by userId
    * @param userId string
    * @returns a user
    */
    async findByUserId(userId: string): Promise<User> {
        logger.info(`Getting user by userId ${userId}`)

        const result = await this.docClient.get({
            TableName: this.userTable,
            Key: { userId: userId }
        }).promise()

        const item = result.Item

        return item as User
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

        logger.info(`Found user by email ${email}: ${result.Count}`)
        if (result.Count == 0) {
            return null
        }

        const item = result.Items[0]

        return item as User
    }

    /**
    * Find a user by username
    * @param username string
    * @returns a user
    */
     async findByUsername(username: string): Promise<User> {
        logger.info(`Getting user by username ${username}`)

        const result = await this.docClient.query({
            TableName: this.userTable,
            IndexName: this.userUsernameIndex,
            KeyConditionExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }).promise()

        logger.info(`Found user by username ${username}: ${result.Count}`)
        if (result.Count == 0) {
            return null
        }

        const item = result.Items[0]

        return item as User
    }

    /**
    * Create a new user or replace a exist user
    * @param user data will store to db
    * @returns void
    */
    async save(user: User) {
        logger.info(`Creating user ${user.email}`)

        await this.docClient.put({
            TableName: this.userTable,
            Item: user,
        }).promise()
    }

    async updateFollowers(userId: string, followers: string[]) {
        logger.info(`Updating user item ${userId}`)

        await this.docClient.update({
            TableName: this.userTable,
            Key: { userId: userId },
            UpdateExpression: 'set followers = :followers, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ":followers": followers,
                ":updatedAt": new Date().toISOString()
            }
        }).promise()
    }
}