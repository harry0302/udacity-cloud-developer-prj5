import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../service/user";
import { getCurrentUser } from "../security/utils";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from "./utils";
import { ErrorREST } from "../utils/error";

const logger = createLogger('UserHandler');

export const getProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting profile event', { event });
    try {
        const username = event.pathParameters.username;
        const userId = getCurrentUser(event);
        const user = await UserService.getUserByUsername(username, userId);

        if (!user) {
            logger.info(`Not found user with username ${username}`)
            throw new ErrorREST(404, `Not found user with username ${username}`)
        }

        return envelop({
            profile: {
                following: user.isFollowing,
                email: user.email,
                bio: user.bio,
                image: user.image,
                username: user.username,
            }
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}

export const followUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing follow user event', { event });
    try {
        const followingUsername = event.pathParameters.username;
        const userId = getCurrentUser(event);

        const user = await UserService.followUser(userId, followingUsername);

        return envelop({
            profile: {
                following: true,
                email: user.email,
                bio: user.bio,
                image: user.image,
                username: user.username,
            }
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}

export const unfollowUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing unfollow user event', { event });
    try {
        const unfollowUsername = event.pathParameters.username;
        const userId = getCurrentUser(event);

        const user = await UserService.unfollowUser(userId, unfollowUsername);

        return envelop({
            profile: {
                following: false,
                email: user.email,
                bio: user.bio,
                image: user.image,
                username: user.username,
            }
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}
