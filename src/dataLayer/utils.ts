import { DocumentClient } from "aws-sdk/clients/dynamodb";

export async function findWithPagination<Type>(docClient: DocumentClient, queryParams: DocumentClient.QueryInput, limit: number, offset: number): Promise<Type[]> {
    const queryResultItems = [];
    while (queryResultItems.length < (offset + limit)) {
        const queryResult = await docClient.query(queryParams)
            .promise();
        queryResultItems.push(...queryResult.Items);
        if (queryResult.LastEvaluatedKey) {
            queryParams.ExclusiveStartKey = queryResult.LastEvaluatedKey;
        } else {
            break;
        }
    }

    return queryResultItems.slice(offset, offset + limit) as Type[];
}