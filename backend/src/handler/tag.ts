import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as TagService from "../service/tag";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from "./utils";

const logger = createLogger('TagHandler')

export const getTags = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting all tags event', { event });
    try {
        const tags = await TagService.getTags();
        
        return envelop({
            tags: tags
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
}