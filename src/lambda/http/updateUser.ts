import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { updateUser } from "../../businessLogic/user";
import { UpdateUserRequest } from "../../request/updateUserRequest";
import { getCurrentUser } from "../../security/utils";
import { createLogger } from "../../utils/logger";
import { envelop, responseError } from "../utils";

const logger = createLogger('updateUserHandler')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing update user event', { event });
    try {
        const userId = getCurrentUser(event);
        const request: UpdateUserRequest = JSON.parse(event.body);

        const user = await updateUser(userId, request);

        return envelop({
            user: {
                ...user
            }
        });
    } catch (error) {
        logger.error(error)
        return responseError(error);
    }
}