import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('GetArticleHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting article event', { event });
    try {
        const slug = event.pathParameters.slug;
        const userId = getCurrentUser(event);

        const result = await ArticleService.getArticleBySlug(slug, userId);

        return envelop({
            article: result,
        });

    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}
