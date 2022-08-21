import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateArticleRequest } from "../../request/createArticleRequest";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ErrorREST } from "../../utils/error";

const logger = createLogger('CreateArticleHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
