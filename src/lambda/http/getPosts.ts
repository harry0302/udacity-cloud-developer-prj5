import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getPostsByUserId } from "../../businessLogic/post"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('getPostsHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all post event', { event });
    try {
        const userId = getCurrentUser(event);
        const result = await getPostsByUserId(userId);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}