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


export const signup = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const getCurrentUserInfo = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing getting current user info event', { event });
    try {
        const currentUser = getCurrentUser(event);
        const user = await UserService.getUserByUsername(currentUser);

        return envelop({
            user: {
                token: getToken(event.headers.Authorization),
                email: user.email,
                bio: user.bio,
                image: user.image,
                username: user.username,
            }
        });
    } catch (error) {
        logger.error(error);
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

