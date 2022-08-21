import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AuthService from "../../businessLogic/auth";
import { envelop, responseError } from '../utils';
import { ErrorREST } from '../../utils/error';
import { HttpStatusCode } from '../../constants/httpStatusCode';
import * as EmailValidator from 'email-validator';
import { SignupRequest } from '../../request/signupRequest';
import { generateToken } from '../../security/utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('SignupHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event });
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body);
        validateSignupRequest(signupRequest);
        const user = await AuthService.signup(signupRequest);

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

function validateSignupRequest(request: SignupRequest) {
    const { email, username, password } = request;
    if (!email || email.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `can't be blank`})
    }

    if (!EmailValidator.validate(email)) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `wrong format`})
    }

    if (!password || password.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {password: `can't be blank`})
    }

    if (!username || username.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {username: `can't be blank`})
    }
}