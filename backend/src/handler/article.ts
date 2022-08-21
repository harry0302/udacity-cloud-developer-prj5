import { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResult } from "aws-lambda";
import { CreateArticleRequest } from "../request/createArticleRequest";
import { createLogger } from "../utils/logger";
import * as ArticleService from "../service/article"
import { getCurrentUser } from "../security/utils";
import { envelop, responseError } from "./utils";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorREST } from "../utils/error";
import { UpdateArticleRequest } from "../request/updateArticleRequest";

const logger = createLogger('ArticleHandler')

export const createArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing creating article event', { event });
    try {
        const request: CreateArticleRequest = JSON.parse(event.body);
        validateCreateArticleRequest(request);
        const userId = getCurrentUser(event);
        const result = await ArticleService.createArticle(userId, request);

        return envelop({
            article: result,
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

export const updateArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing updating article event', { event });
    try {
        const request: UpdateArticleRequest = JSON.parse(event.body);
        validateCreateArticleRequest(request);
        const slug = event.pathParameters.slug;
        const username = getCurrentUser(event);
        const result = await ArticleService.updateArticle(username, slug, request);

        return envelop({
            article: result,
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

export const getArticles = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const getArticlesFeed = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const getArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const deleteArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const favoriteArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const unfavoriteArticle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing unfavorite article event', { event });
    try {
        const slug = event.pathParameters.slug;
        const userId = getCurrentUser(event);

        const res = await ArticleService.unfavoriteArticle(userId, slug);

        return envelop({article: res});

    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}

function validateGetAllArticlesRequest(params: APIGatewayProxyEventQueryStringParameters) {
    if ((params.tag && params.author) ||
        (params.author && params.favorited) || (params.favorited && params.tag)) {
        throw new ErrorREST(HttpStatusCode.BadRequest, { param: 'only one of these can be specified: [tag, author, favorited]' });
    }
}

function validateCreateArticleRequest(request: CreateArticleRequest) {
    if (!request.title || request.title.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, { title: `can't be blank` });
    }

    if (!request.body || request.body.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, { body: `can't be blank` });
    }

    if (!request.description || request.description.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, { description: `can't be blank` });
    }
}
