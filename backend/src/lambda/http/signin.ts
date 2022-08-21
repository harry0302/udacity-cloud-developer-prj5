import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AuthService from "../../businessLogic/auth";
import { envelop, responseError } from '../utils';
import { ErrorREST } from '../../utils/error';
import { HttpStatusCode } from '../../constants/httpStatusCode';
import * as EmailValidator from 'email-validator';
import { generateToken } from '../../security/utils';
import { createLogger } from '../../utils/logger';
import { SigninRequest } from '../../request/signinRequest';

const logger = createLogger('SigninHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event });
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body);
        validateSigninRequest(signinRequest);
        const user = await AuthService.signin(signinRequest);

        return envelop({
            user: {
                token: generateToken(user.username),
                email: user.email,
                bio: user.bio,
                image: user.image,
                username: user.username,
            },
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

function validateSigninRequest(request: SigninRequest) {
    const { email, password } = request;
    if (!email || email.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `can't be blank`})
    }

    if (!EmailValidator.validate(email)) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `wrong format`})
    }

    if (!password || password.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {password: `can't be blank`})
    }
}
