import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../dto/signinRequest";
import { signin } from "../service/auth";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from './utils';

const logger = createLogger('signin')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event })
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body)
        const result = await signin(signinRequest)

        return envelop(result)
    } catch (error) {
        return responseError(error)
    }
}