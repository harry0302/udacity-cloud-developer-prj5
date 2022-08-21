import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('GetArticlesFeedHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all articles feed event', { event });
    try {
        const username = getCurrentUser(event);

        const result = await ArticleService.getArticlesFeed(username);

        return envelop({
            articles: result,
        });

    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}
