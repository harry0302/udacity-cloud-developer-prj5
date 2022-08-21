import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(require('aws-sdk'))

export let client : DocumentClient = new XAWS.DynamoDB.DocumentClient();

export async function queryAll<Type>(docClient: DocumentClient, queryParams: DocumentClient.QueryInput): Promise<Type[]> {
    const queryResultItems = [];
    do {
        const queryResult = await docClient.query(queryParams)
            .promise();
        queryResultItems.push(...queryResult.Items);
        if (queryResult.LastEvaluatedKey) {
            queryParams.ExclusiveStartKey = queryResult.LastEvaluatedKey;
        } else {
            break;
        }
    } while (queryParams.ExclusiveStartKey);

    return queryResultItems as Type[];
}