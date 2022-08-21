import { DocumentClient } from "aws-sdk/clients/dynamodb";

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