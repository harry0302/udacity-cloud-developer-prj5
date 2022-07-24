import { User } from "../entity/user";
import { UserRepository } from "../repository/user";
import { createLogger } from "../utils/logger";

const logger = createLogger('UserService')

const userRepo = new UserRepository()

export async function getUserByUsername(username: string): Promise<User> {
    logger.info(`Retrieving user by ${username}`)

    return await userRepo.findByUsername(username)
}

