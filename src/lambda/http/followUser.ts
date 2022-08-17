import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { followUser } from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('followUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing follow user event', { event });
    try {
        const followingUser = event.pathParameters.username;
        const userId = getCurrentUser(event);

        const user = await followUser(userId, followingUser)

        return envelop({
            profile: {
                following: true,
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}