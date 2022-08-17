import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../../request/signinRequest";
import { signin } from "../../businessLogic/auth";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';
import { ErrorREST } from '../../utils/error';
import { HttpStatusCode } from '../../constants/httpStatusCode';
import * as EmailValidator from 'email-validator';

const logger = createLogger('SigninHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event });
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body);
        validateSigninRequest(signinRequest);
        const result = await signin(signinRequest);

        return envelop(result);
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

function validateSigninRequest(request: SigninRequest) {
    const { email, password } = request;
    if (!email) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email required`)
    }

    if (!EmailValidator.validate(email)) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Email wrong format`)
    }

    if (!password) {
        throw new ErrorREST(HttpStatusCode.BadRequest, `Password required`)
    }
}
