import { APIGatewayProxyResult } from "aws-lambda";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorREST } from "../utils/error";

export function responseError(error: Error): APIGatewayProxyResult {
    if (error == null || !(error instanceof ErrorREST)) {
        error = new ErrorREST(HttpStatusCode.InternalServerError, error.message);
    }

    var error2 = error as ErrorREST
    return envelop(error2.message, error2.statusCode)
}

export function envelop(res: any, statusCode: number = 200): APIGatewayProxyResult {
    let body: string;
    if (statusCode == 200) {
        body = JSON.stringify(res);
    } else {
        body = JSON.stringify({ errors: { body: [res] } });
    }

    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body,
    };
}

export function validatePaginationRequest(limit: number, offset: number) {
    if (limit <= 0) {
        throw new ErrorREST(HttpStatusCode.BadRequest, "Limit value invalid")
    }
    if (offset < 0) {
        throw new ErrorREST(HttpStatusCode.BadRequest, "Offset value invalid")
    }
}