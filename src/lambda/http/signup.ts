import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { signup } from "../../businessLogic/auth";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';
import { SignupRequest } from '../../request/signupRequest';
import { ErrorREST } from '../../utils/error';
import * as EmailValidator from 'email-validator';
import { HttpStatusCode } from '../../constants/httpStatusCode';

const logger = createLogger('SignupHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event });
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body);
        validateSignupRequest(signupRequest);
        const result = await signup(signupRequest);

        return envelop(result, 200);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

function validateSignupRequest(request: SignupRequest) {
    const { email, username, password } = request;
    if (!email) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email required`)
    }

    if (!EmailValidator.validate(email)) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email wrong format`)
    }

    if (!username) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Username required`)
    }

    if (!password) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Password required`)
    }
}
