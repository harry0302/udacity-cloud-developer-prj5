import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../../businessLogic/user";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";
import { ErrorREST } from "../../utils/error";

const logger = createLogger('GetProfileHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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