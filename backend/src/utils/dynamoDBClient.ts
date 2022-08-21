import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(require('aws-sdk'))

export let client : DocumentClient = new XAWS.DynamoDB.DocumentClient();