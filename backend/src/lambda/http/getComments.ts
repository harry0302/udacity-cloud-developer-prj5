import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getCurrentUser } from "../../security/utils";
import * as CommentService from "../../businessLogic/comment";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('GetCommentsHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getComments event', { event })
    try {
        const slug = event.pathParameters.slug;
        const userId = getCurrentUser(event);

        const result = await CommentService.getCommentsBySlug(userId, slug);

        return envelop({
            comments: result, 
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}
