import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { AWS_REGION } from '../common'

const dynamo = new DynamoDBClient({ region: AWS_REGION })
export { dynamo }