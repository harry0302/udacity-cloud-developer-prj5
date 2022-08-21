import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('UnfollowUserHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
