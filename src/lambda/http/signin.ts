import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../../request/signinRequest";
import { signin } from "../../businessLogic/auth";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';

const logger = createLogger('SigninHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event });
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body);
        const result = await signin(signinRequest);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}
