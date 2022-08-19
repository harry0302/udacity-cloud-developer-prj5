import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from "./utils";

const logger = createLogger('TagsHandler')

export const getTags = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all tags event', { event });
    try {

        return envelop({
            tags: ["default", "testing"]
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}