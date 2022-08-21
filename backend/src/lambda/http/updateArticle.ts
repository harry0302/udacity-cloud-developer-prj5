import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import * as ArticleService from "../../businessLogic/article"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";
import { UpdateArticleRequest } from "../../request/updateArticleRequest";
import { ErrorREST } from "../../utils/error";
import { HttpStatusCode } from "../../constants/httpStatusCode";

const logger = createLogger('UpdateArticleHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing updating article event', { event });
    try {
        const request: UpdateArticleRequest = JSON.parse(event.body);
        validateUpdateArticleRequest(request);
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

function validateUpdateArticleRequest(request: UpdateArticleRequest) {
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
