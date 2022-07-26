import 'source-map-support/register'
import { UserSecured } from "../models/user";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";

const logger = createLogger('UserService')

const userRepo = new UserRepository()

export async function getUserByUsername(username: string): Promise<UserSecured> {
    logger.info(`Retrieving user ${username}`)

    return await userRepo.findByUsername(username)
}

