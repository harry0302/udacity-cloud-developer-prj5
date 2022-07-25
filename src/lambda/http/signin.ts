import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SigninRequest } from "../../models/signinRequest";
import { signin } from "../../service/auth";
import { createLogger } from "../../utils/logger";

const logger = createLogger('signin')

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing singin event', { event })
    try {
        const signinRequest: SigninRequest = JSON.parse(event.body)
        const result = await signin(signinRequest)

        return {
            statusCode: 200,
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