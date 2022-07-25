import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SignupRequest } from "../../models/signupRequest";
import { signup } from "../../service/auth";
import { createLogger } from "../../utils/logger";

const logger = createLogger('signup')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singup event', { event })
    try {
        const signupRequest: SignupRequest = JSON.parse(event.body)
        const result = await signup(signupRequest)

        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(result),
        }
    } catch (error) {
        throw error
    }
}