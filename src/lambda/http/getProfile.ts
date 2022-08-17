import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserByUsername } from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('getProfileHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting user event', { event });
    try {
        const username = event.pathParameters.username;
        const userId = getCurrentUser(event);
        const user = await getUserByUsername(username);

        let isFollowing = false;

        if (user.followers && userId) {
            isFollowing = user.followers.includes(userId)
        }

        return envelop({
            profile: {
                following: isFollowing,
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}