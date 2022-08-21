import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ErrorREST } from "../../utils/error";

const logger = createLogger('GetArticlesHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all articles event', { event });
    try {
        const params = event.queryStringParameters || {};
        const username = getCurrentUser(event);

        validateGetAllArticlesRequest(params);

        const result = await ArticleService.getArticles({
            author: params.author,
            favorited: params.favorited,
            tag: params.tag,
            currentUser: username,
        });

        return envelop({
            articles: result,
        });

    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

function validateGetAllArticlesRequest(params: APIGatewayProxyEventQueryStringParameters) {
    if ((params.tag && params.author) ||
        (params.author && params.favorited) || (params.favorited && params.tag)) {
        throw new ErrorREST(HttpStatusCode.BadRequest, { param: 'only one of these can be specified: [tag, author, favorited]' });
    }
}
