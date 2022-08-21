import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('DeleteArticleHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing delete article event', { event });
    try {
        const slug = event.pathParameters.slug;
        const userId = getCurrentUser(event);

        await ArticleService.deleteArticle(userId, slug);

        return envelop({});

    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}
