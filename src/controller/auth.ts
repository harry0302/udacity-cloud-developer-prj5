import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../dto/signinRequest";
import * as AuthService from "../service/auth";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from './utils';
import { SignupRequest } from '../dto/signupRequest';

const logger = createLogger('AuthController')

export const signin = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event })
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body)
        const result = await AuthService.signin(signinRequest)

        return envelop(result)
    } catch (error) {
        return responseError(error)
    }
}

export const signup = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event })
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body)
        const result = await AuthService.signup(signupRequest)

        return envelop(result, 201)
    } catch (error) {
        return responseError(error)
    }
}
