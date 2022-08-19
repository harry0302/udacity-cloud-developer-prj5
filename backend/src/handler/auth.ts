import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../request/signinRequest";
import * as AuthService from "../service/auth";
import * as UserService from "../service/user";
import { createLogger } from "../utils/logger";
import { envelop, responseError } from './utils';
import { ErrorREST } from '../utils/error';
import { HttpStatusCode } from '../constants/httpStatusCode';
import * as EmailValidator from 'email-validator';
import { SignupRequest } from '../request/signupRequest';
import { generateToken, getCurrentUser, getToken } from '../security/utils';
import { UpdateUserRequest } from '../request/updateUserRequest';

const logger = createLogger('AuthHandler')

export const signin = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event });
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body);
        validateSigninRequest(signinRequest);
        const user = await AuthService.signin(signinRequest);

        return envelop({
            user: {
                token: generateToken(user.userId),
                email: user.email,
                userId: user.userId,
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


export const signup = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event });
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body);
        validateSignupRequest(signupRequest);
        const user = await AuthService.signup(signupRequest);

        return envelop({
            user: {
                token: generateToken(user.userId),
                email: user.email,
                userId: user.userId,
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

export const getCurrentUserInfo = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting current user info event', { event });
    try {
        const userId = getCurrentUser(event);
        const user = await UserService.getUserById(userId);

        return envelop({
            user: {
                token: getToken(event.headers.Authorization),
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

export const updateCurrentUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing update current user event', { event });
    try {
        const userId = getCurrentUser(event);
        const request: UpdateUserRequest = JSON.parse(event.body);

        const user = await UserService.updateUser(userId, request);

        return envelop({
            user: {
                email: user.email,
                userId: user.userId,
                bio: user.bio,
                image: user.image,
                username: user.username,
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}

