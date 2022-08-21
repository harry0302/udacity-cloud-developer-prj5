import { HttpStatusCode } from "../constants/httpStatusCode";
import { UserRepository } from "../repository/user";
import { User } from "../models/user";
import { generatePassword } from "../security/utils";
import { ErrorREST } from "../utils/error";
import { createLogger } from "../utils/logger";

const logger = createLogger('UsersService');

const userRepo = new UserRepository();

interface UserWithFollowInfo extends User {
    isFollowing: boolean
}

export async function getUserByUsername(username: string, currentUser?: string): Promise<UserWithFollowInfo> {
    logger.info(`Retrieving user by username ${username}`);
    const user = await userRepo.findByUsername(username);

    if (!user) {
        return null;
    }

    let isFollowing = false;

    if (user.followers && currentUser) {
        isFollowing = user.followers.includes(currentUser);
    }

    return {
        isFollowing: isFollowing,
        ...user,
    };
}


export async function followUser(currentUsername: string, followingUsername: string): Promise<User> {
    logger.info(`${currentUsername} start following user ${followingUsername}`);
    const user = await userRepo.findByUsername(followingUsername);

    if (!user) {
        logger.info(`Not found user with username ${followingUsername}`)
        throw new ErrorREST(404, `Not found user with username ${followingUsername}`)
    }

    if (user.followers) {
        if (!user.followers.includes(currentUsername)) {
            user.followers.push(currentUsername);
        }
    } else {
        user.followers = [currentUsername]
    }

    user.updatedAt = new Date().toISOString();

    await userRepo.save(user);

    const currentUser = await userRepo.findByUsername(currentUsername);

    if (currentUser.following) {
        if (!currentUser.following.includes(followingUsername)) {
            currentUser.following.push(followingUsername);
        }
    } else {
        currentUser.following = [followingUsername];
    }

    currentUser.updatedAt = new Date().toISOString();

    await userRepo.save(currentUser);

    return user;
}

export async function unfollowUser(currentUsername: string, unfollowUsername: string): Promise<User> {
    logger.info(`${currentUsername} start following user ${unfollowUsername}`);
    const user = await userRepo.findByUsername(unfollowUsername);

    if (!user) {
        logger.info(`Not found user with username ${unfollowUsername}`)
        throw new ErrorREST(404, `Not found user with username ${unfollowUsername}`)
    }

    if (user.followers) {
        if (user.followers.includes(currentUsername)) {
            user.followers = user.followers.filter(
                e => e != currentUsername
            );
        }
    } else {
        user.followers = []
    }

    user.updatedAt = new Date().toISOString();

    await userRepo.save(user);

    const currentUser = await userRepo.findByUsername(currentUsername);

    if (currentUser.following) {
        if (currentUser.following.includes(unfollowUsername)) {
            currentUser.following = currentUser.following.filter(
                e => e != unfollowUsername
            );
        }
    } else {
        currentUser.following = []
    }

    currentUser.updatedAt = new Date().toISOString();

    await userRepo.save(currentUser);

    return user;
}

interface updateUserInput {
    email: string
    bio: string
    image: string
    newPassword: string
}

export async function updateUser(currentUser: string, input: updateUserInput): Promise<User> {
    logger.info(`Updating user ${currentUser}`);
    const user = await userRepo.findByUsername(currentUser);

    if (!user) {
        logger.info(`Not found user with username ${currentUser}`)
        throw new ErrorREST(404, `Not found user with username ${currentUser}`)
    }

    if (user.email != input.email) {
        const userWithThisEmail = await userRepo.findByEmail(input.email);
        if (userWithThisEmail) {
            logger.error(`Email already taken: [${input.email}]`);
            throw new ErrorREST(HttpStatusCode.BadRequest, `Email already taken: [${input.email}]`);
        }
        user.email = input.email
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

    user.updatedAt = new Date().toISOString();

    await userRepo.save(user);

    return user;
}
