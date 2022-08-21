import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getCurrentUser } from "../../security/utils";
import * as CommentService from "../../businessLogic/comment";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('DeleteCommentHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing delete comment event', { event });
    try {
        const id = event.pathParameters.id;
        const userId = getCurrentUser(event);

        await CommentService.deleteComment(userId, id);

        return envelop({});

    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}


