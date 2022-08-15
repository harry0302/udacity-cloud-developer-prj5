import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('S3Storage')

export class S3Storage {

    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
    ) { }

    // Generates an AWS signed URL for retrieving objects
    getGetSignedUrl(key: string): string {
        logger.info("Getting getSignedURL")

        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: this.urlExpiration,
        });
    }

    // Generates an AWS signed URL for uploading objects
    getPutSignedUrl(key: string): string {
        logger.info("Getting putSignedURL")
        
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: this.urlExpiration,
        });
    }

}