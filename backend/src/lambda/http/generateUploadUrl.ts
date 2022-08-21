import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";
import * as ArticleService from "../../businessLogic/article"
import { getPutSignedUrl } from "../../utils/s3Helper";
import { ErrorREST } from "../../utils/error";
import { HttpStatusCode } from "../../constants/httpStatusCode";

const logger = createLogger('GenerateUploadUrlHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing generateUploadUrl event', { event })
    try {
        const slug = event.pathParameters.slug;

        const exist = await ArticleService.existsArticleBySlug(slug);
        
        if (!exist) {
            logger.error(`Article ${slug} not found`);
            throw new ErrorREST(HttpStatusCode.BadRequest, 'Item not found');
        }

        const url = getPutSignedUrl(slug);

        return envelop({
            url: url,
        });
    } catch (error) {
        logger.error(error);
        return responseError(error);
    }
} 