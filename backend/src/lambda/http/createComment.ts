import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { CreateCommentRequest } from "../../request/createCommentRequest";
import { getCurrentUser } from "../../security/utils";
import * as CommentService from "../../businessLogic/comment";
import { ErrorREST } from "../../utils/error";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('CreateCommentHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing createComment event', { event })
    try {
        const slug = event.pathParameters.slug;
        const request: CreateCommentRequest = JSON.parse(event.body);
        validateCreateCommentRequest(request);
        const userId = getCurrentUser(event);

        const result = await CommentService.createComment({
            body: request.body,
            author: userId,
            slug: slug,
        });

        return envelop({
            comment: result, 
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}

function validateCreateCommentRequest(request: CreateCommentRequest) {
    if (!request.body || request.body.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {body: `can't be blank`});
    }
}
