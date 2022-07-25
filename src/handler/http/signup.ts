import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SignupRequest } from "../../models/signupRequest";
import { signup } from "../../service/auth";
import { createLogger } from "../../utils/logger";
import { envelop } from "../utils";

const logger = createLogger('signup')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event })
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body)
        const result = await signup(signupRequest)

        return envelop(result)
    } catch (error) {
        const { message } = error as Error
        
        return envelop(message)
    }
}