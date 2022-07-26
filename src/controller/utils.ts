import { APIGatewayProxyResult } from "aws-lambda";
import { ErrorREST, Errors } from "../utils/error";

export function responseError(error: any): APIGatewayProxyResult {
    if (error == null || !(error instanceof ErrorREST)) {//error is not a custom error
        error = new ErrorREST(Errors.InternalServerError);
    }

    var error2 = error as ErrorREST
    return envelop(error2.response, error2.response.status)
}

export function envelop(res: any, statusCode: number = 200): APIGatewayProxyResult {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(res, null, 2),
    };
}