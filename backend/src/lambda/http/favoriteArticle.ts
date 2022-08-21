import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('FavoriteArticleHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing favorite article event', { event });
    try {
        const slug = event.pathParameters.slug;
        const userId = getCurrentUser(event);

        const res = await ArticleService.favoriteArticle(userId, slug);

        return envelop({article: res});

    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}
