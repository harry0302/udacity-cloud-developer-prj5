import 'source-map-support/register'
import { User } from '../models/user'
import { client } from '../utils/dynamoDBHelper'
import { createLogger } from '../utils/logger'

const logger = createLogger('UserRepository')

export class UserRepository {

    constructor(
        private readonly docClient = client,
        private readonly userTable = process.env.USERS_TABLE,
        private readonly userByEmailIndex = process.env.USERS_BY_EMAIL_INDEX
    ) { }

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

        const result = await this.docClient.get({
            TableName: this.userTable,
            Key: {
                username: username,
            }
        }).promise()

        const item = result.Item

        return item as User
    }

    /**
    * Create a new user or replace a exist user
    * @param user data will store to db
    * @returns void
    */
    async save(user: User) {
        logger.info(`Saving user ${user.email}`)

        await this.docClient.put({
            TableName: this.userTable,
            Item: user,
        }).promise()
    }

    // async updateFollowers(userId: string, followers: string[]) {
    //     logger.info(`Updating user item ${userId}`)

    //     await this.docClient.update({
    //         TableName: this.userTable,
    //         Key: { userId: userId },
    //         UpdateExpression: 'set followers = :followers, updatedAt = :updatedAt',
    //         ExpressionAttributeValues: {
    //             ":followers": followers,
    //             ":updatedAt": new Date().toISOString()
    //         }
    //     }).promise()
    // }
}