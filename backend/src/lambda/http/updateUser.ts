import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as UserService from "../../businessLogic/user";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from '../utils';
import { getCurrentUser } from '../../security/utils';
import { UpdateUserRequest } from '../../request/updateUserRequest';
import * as EmailValidator from 'email-validator';
import { ErrorREST } from '../../utils/error';
import { HttpStatusCode } from '../../constants/httpStatusCode';

const logger = createLogger('UpdateUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing update current user event', { event });
    try {
        const userId = getCurrentUser(event);
        const request: UpdateUserRequest = JSON.parse(event.body);
        validateUpdateUserRequest(request);

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
        logger.error(error);
        return responseError(error);
    }
}

function validateUpdateUserRequest(request: UpdateUserRequest) {
    const { email } = request;
    if (!email || email.trim().length == 0) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `can't be blank`})
    }

    if (!EmailValidator.validate(email)) {
        throw new ErrorREST(HttpStatusCode.UnprocessableEntity, {email: `wrong format`})
    }
}
