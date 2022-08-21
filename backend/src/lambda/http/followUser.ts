import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('FollowUserHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
