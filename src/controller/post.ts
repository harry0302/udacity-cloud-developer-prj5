import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreatePostRequest } from "../dto/createPostRequest";
import { createLogger } from "../utils/logger";
import * as PostService from "../service/post"
import { getCurrentUser } from "../security/utils";
import { envelop, responseError } from "./utils";

const logger = createLogger('PostController')

export const createPost = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing creating post event', { event })
    try {
        const createPostRequest: CreatePostRequest = JSON.parse(event.body)
        const username = getCurrentUser(event)
        const result = await PostService.createPost(username, createPostRequest)

        return envelop(result)
    } catch (error) {
        return responseError(error)
    }
}
