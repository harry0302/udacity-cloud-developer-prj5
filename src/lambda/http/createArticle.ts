import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateArticleRequest } from "../../request/createArticleRequest";
import { createLogger } from "../../utils/logger";
import { createArticle } from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('createArticleHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing creating article event', { event });
    try {
        const request: CreateArticleRequest = JSON.parse(event.body);
        const userId = getCurrentUser(event);
        const result = await createArticle(userId, request);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}