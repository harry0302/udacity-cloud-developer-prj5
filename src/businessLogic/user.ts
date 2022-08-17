import { HttpStatusCode } from "../constants/httpStatusCode";
import { UserRepository } from "../dataLayer/user";
import { UserSecured } from "../models/user";
import { generatePassword } from "../security/utils";
import { ErrorREST } from "../utils/error";
import { createLogger } from "../utils/logger";

const logger = createLogger('UsersService');

const userRepo = new UserRepository();

export async function getUserByUsername(username: string): Promise<UserSecured> {
    logger.info(`Retrieving user by username ${username}`);
    const item = await userRepo.findByUsername(username);

    if (!item) {
        logger.info(`Not found user with username ${username}`)
        throw new ErrorREST(404, `Not found user with username ${username}`)
    }

    delete item.passwordHash;

    return item
}

export async function getUserById(id: string): Promise<UserSecured> {
    logger.info(`Retrieving user by id ${id}`);
    const item = await userRepo.findByUserId(id);

    if (!item) {
        logger.info(`Not found user with id ${id}`)
        throw new ErrorREST(404, `Not found user with id ${id}`)
    }

    delete item.passwordHash;

    return item
}


export async function followUser(userId: string, followingUser: string): Promise<UserSecured> {
    logger.info(`${userId} start following user ${followingUser}`);
    const user = await userRepo.findByUsername(followingUser);

    if (!user) {
        logger.info(`Not found user with username ${followingUser}`)
        throw new ErrorREST(404, `Not found user with username ${followingUser}`)
    }

    if (user.followers) {
        if (!user.followers.includes(userId)) {
            user.followers.push(userId);
        }
    } else {
        user.followers = []
    }

    await userRepo.updateFollowers(user.userId, user.followers)

    delete user.passwordHash;

    return user
}

export async function unfollowUser(userId: string, unfollowUser: string): Promise<UserSecured> {
    logger.info(`${userId} start following user ${userId}`);
    const user = await userRepo.findByUsername(unfollowUser);

    if (!user) {
        logger.info(`Not found user with username ${unfollowUser}`)
        throw new ErrorREST(404, `Not found user with username ${unfollowUser}`)
    }

    if (user.followers) {
        if (user.followers.includes(userId)) {
            user.followers = user.followers.filter(
                e => e != userId
            );
        }
    } else {
        user.followers = []
    }

    await userRepo.updateFollowers(user.userId, user.followers)

    delete user.passwordHash;

    return user
}

interface updateUserInput {
    email: string
    username: string
    bio: string
    image: string
    newPassword: string
}

export async function updateUser(userId: string, input: updateUserInput): Promise<UserSecured> {
    logger.info(`Updating user ${userId}`);
    const user = await userRepo.findByUserId(userId);

    if (!user) {
        logger.info(`Not found user with id ${userId}`)
        throw new ErrorREST(404, `Not found user with id ${userId}`)
    }

    if (user.email != input.email) {
        const userWithThisEmail = await userRepo.findByEmail(input.email);
        if (userWithThisEmail) {
            logger.error(`Email already taken: [${input.email}]`);
            throw new ErrorREST(HttpStatusCode.BadRequest, `Email already taken: [${input.email}]`);
        }
        user.email = input.email
    }

    if (user.username != input.username) {
        const userWithThisUsername = await userRepo.findByUsername(input.username);
        if (userWithThisUsername) {
            logger.error(`Username already taken: [${input.username}]`);
            throw new ErrorREST(HttpStatusCode.BadRequest, `Username already taken: [${input.username}]`);
        }
        user.username = input.username
    }

    if (input.newPassword) {
        user.passwordHash = await generatePassword(input.newPassword)
    }

    if (input.image) {
        user.image = input.image;
    }

    if (input.bio) {
        user.bio = input.bio;
    }

    user.updatedAt = new Date().toISOString()

    await userRepo.save(user)

    delete user.passwordHash;

    return user
}
