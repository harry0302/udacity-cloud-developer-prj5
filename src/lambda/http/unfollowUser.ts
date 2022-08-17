import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { unfollowUser } from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('unfollowUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing unfollow user event', { event });
    try {
        const unfollowUsername = event.pathParameters.username;
        const userId = getCurrentUser(event);

        const user = await unfollowUser(userId, unfollowUsername)

        return envelop({
            profile: {
                following: false,
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}