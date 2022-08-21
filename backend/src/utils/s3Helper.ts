import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('S3Helper')

const s3 = new XAWS.S3({ signatureVersion: 'v4' });
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)

// Generates an AWS signed URL for retrieving objects
export function getGetSignedUrl(key: string): string {
    logger.info("Getting getSignedURL")

    return s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: key,
        Expires: urlExpiration,
    });
}

// Generates an AWS signed URL for uploading objects
export function getPutSignedUrl(key: string): string {
    logger.info("Getting putSignedURL")

    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: key,
        Expires: urlExpiration,
    });
} 