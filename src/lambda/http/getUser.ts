import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getUserById } from "../../businessLogic/user";
import { getCurrentUser, getToken } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('getUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting current user event', { event });
    try {
        const userId = getCurrentUser(event);
        const user = await getUserById(userId);

        return envelop({
            user: {
                token: getToken(event.headers.Authorization),
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}