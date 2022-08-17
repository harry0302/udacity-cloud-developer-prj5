import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { getArticles } from "../../businessLogic/article"
import { envelop, responseError, validatePaginationRequest } from "../utils";
import { ErrorREST } from "../../utils/error";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { getCurrentUser } from "../../security/utils";

const logger = createLogger('getArticlesHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all articles event', { event });
    try {
        const params = event.queryStringParameters || {};
        const userId = getCurrentUser(event);
        const limit = parseInt(params.limit) || 20;
        const offset = parseInt(params.offset) || 0;

        validatePaginationRequest(limit, offset)
        validateGetAllArticlesRequest(params);

        const result = await getArticles({
            author: params.author,
            favorited: params.favorited,
            limit: limit,
            offset: offset,
            tag: params.tag,
            userId: userId,
        });

        return envelop({
            articles: result, 
        });

    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

function validateGetAllArticlesRequest(params:APIGatewayProxyEventQueryStringParameters) {
    if ((params.tag && params.author) ||
      (params.author && params.favorited) || (params.favorited && params.tag)) {
        throw new ErrorREST(HttpStatusCode.BadRequest, 'Only one of these can be specified: [tag, author, favorited]');
    }
}