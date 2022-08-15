import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreatePostRequest } from "../../request/createPostRequest";
import { createLogger } from "../../utils/logger";
import { createPost } from "../../businessLogic/post"
import { getCurrentUser } from "../../security/utils";
import { envelop, responseError } from "../utils";

const logger = createLogger('createPostHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing creating post event', { event });
    try {
        const createPostRequest: CreatePostRequest = JSON.parse(event.body);
        const userId = getCurrentUser(event);
        const result = await createPost(userId, createPostRequest);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}