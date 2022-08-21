import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../../businessLogic/user";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';
import { getCurrentUser, getToken } from '../../security/utils';

const logger = createLogger('GetUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting current user info event', { event });
    try {
        const currentUser = getCurrentUser(event);
        const user = await UserService.getUserByUsername(currentUser);

        return envelop({
            user: {
                token: getToken(event.headers.Authorization),
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