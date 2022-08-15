import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { generateUploadUrl } from "../../businessLogic/post"
import { envelop, responseError } from "../utils";
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('generateUploadUrlHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl event', { event })
    try {
        const attachmentId = uuidv4();
        const url = generateUploadUrl(attachmentId);

        return envelop({
            url: url,
            id: attachmentId,
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}