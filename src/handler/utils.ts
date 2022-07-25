import { APIGatewayProxyResult } from "aws-lambda";

export function envelop(res : any, statusCode : number = 200) : APIGatewayProxyResult {
    let body: string;
    if (statusCode == 200) {
        body = JSON.stringify(res, null, 2);
    } else {
        body = JSON.stringify({ errors: { body: [res] } }, null, 2);
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