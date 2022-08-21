import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../utils/logger";
import * as FileService from "../service/file"
import { envelop, responseError } from "./utils";
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('FileHandler')

export const generateUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl event', { event })
    try {
        const attachmentId = uuidv4();
        const url = FileService.getGetSignedUrl(attachmentId);

        return envelop({
            url: url,
            key: attachmentId,
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}