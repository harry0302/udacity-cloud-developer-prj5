import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from "aws-lambda";
import { CreateArticleRequest } from "../request/createArticleRequest";
import { createLogger } from "../utils/logger";
import * as ArticleService from "../service/article"
import { getCurrentUser } from "../security/utils";
import { envelop, responseError } from "./utils";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorREST } from "../utils/error";

const logger = createLogger('ArticleHandler')

export const createArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing creating article event', { event });
    try {
        const request: CreateArticleRequest = JSON.parse(event.body);
        const userId = getCurrentUser(event);
        const result = await ArticleService.createArticle(userId, request);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

export const getArticles = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all articles event', { event });
    try {
        const params = event.queryStringParameters || {};
        const userId = getCurrentUser(event);

        validateGetAllArticlesRequest(params);

        const result = await ArticleService.getArticles({
            author: params.author,
            favorited: params.favorited,
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
