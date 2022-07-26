import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SignupRequest } from "../../dto/signupRequest";
import { signup } from "../../service/auth";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';

const logger = createLogger('signup')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event })
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body)
        const result = await signup(signupRequest)

        return envelop(result, 201)
    } catch (error) {
        return responseError(error)
    }
}