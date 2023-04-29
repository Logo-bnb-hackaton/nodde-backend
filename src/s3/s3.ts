import AWS from 'aws-sdk'
import { AWS_REGION } from '../common'

const s3 = new AWS.S3({ region: AWS_REGION })
export { s3 }