import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { signup } from "../../businessLogic/auth";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';
import { SignupRequest } from '../../request/signupRequest';

const logger = createLogger('SignupHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event });
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body);
        const result = await signup(signupRequest);

        return envelop(result, 201);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}
