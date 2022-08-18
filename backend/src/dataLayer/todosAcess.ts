import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

interface getTodoItemsInput {
  userId: string
  name: string
}

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosByUserIndex = process.env.TODOS_BY_USER_INDEX
  ) { }

  async todoItemExists(todoId: string): Promise<boolean> {
    const item = await this.getTodoItem(todoId)
    return !!item
  }

  async getTodoItems(input: getTodoItemsInput): Promise<TodoItem[]> {
    logger.info(`Getting all todos for user ${input.userId} from ${this.todosTable}`)

    var queryParams : DocumentClient.QueryInput = {
      TableName: this.todosTable,
      IndexName: this.todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': input.userId
      }
    }

    if (input.name) {
      queryParams.FilterExpression = 'contains(#nametodos, :name)';
      queryParams.ExpressionAttributeValues[':name'] = input.name;
      queryParams.ExpressionAttributeNames = {
        '#nametodos': "name",
      };
    }

    const queryResultItems = [];
    do {
        const queryResult = await this.docClient.query(queryParams)
            .promise();
        queryResultItems.push(...queryResult.Items);
        if (queryResult.LastEvaluatedKey) {
            queryParams.ExclusiveStartKey = queryResult.LastEvaluatedKey;
        } else {
            break;
        }
    } while (queryParams.ExclusiveStartKey);

    logger.info(`Found ${queryResultItems.length} todos in ${this.todosTable}`, input)

    return queryResultItems as TodoItem[];
  }

  async getTodoItem(todoId: string): Promise<TodoItem> {
    logger.info(`Getting todo ${todoId} from ${this.todosTable}`)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: { todoId: todoId }
    }).promise()

    const item = result.Item

    return item as TodoItem
  }

  async createTodoItem(todoItem: TodoItem) {
    logger.info(`Putting todo ${todoItem.todoId} into ${this.todosTable}`)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem,
    }).promise()
  }

  async updateTodoItem(todoId: string, todoUpdate: TodoUpdate) {
    logger.info(`Updating todo item ${todoId} in ${this.todosTable}`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: { todoId: todoId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ExpressionAttributeValues: {
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise()
  }

  async deleteTodoItem(todoId: string) {
    logger.info(`Deleting todo item ${todoId} from ${this.todosTable}`)

    await this.docClient.delete({
      TableName: this.todosTable,
      Key: { todoId: todoId }
    }).promise()
  }

  async updateAttachmentUrl(todoId: string, attachmentUrl: string) {
    logger.info(`Updating attachment URL for todo ${todoId} in ${this.todosTable}`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: { todoId: todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

}