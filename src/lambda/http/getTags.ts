import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('getTagsHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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