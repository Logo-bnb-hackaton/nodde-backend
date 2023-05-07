import { documentClient } from "@/db/dynamo";
import { PutItemCommand, PutItemInput } from "@aws-sdk/client-dynamodb";
import { GetCommand, GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";


export interface SubscriptionDO {
    id: string,
    coin: string,
    description: string,
    instant: string,
    mainImageId: string,
    ownerId: string,
    previewImageId: string,
    price: string,
    status: SubscriptionStatus,
    title: string
}

export type SubscriptionStatus = 'DRAFT' | 'UNPUBLISHED' | 'PUBLISHED';

export interface SubscriptionRepository {
    getById(id: string): Promise<SubscriptionDO>
    put(subscription: SubscriptionDO): Promise<void>
}

export const SubscriptionTableName = "Community-subscription";

export class SubscriptionRepositoryImpl implements SubscriptionRepository {
    
    async getById(id: string): Promise<SubscriptionDO> {

        console.log(`Start get subscription ${id}`);
        
        const input: GetCommandInput = {
            TableName: SubscriptionTableName,
            Key: marshall({
                id: id
            })
        }

        const command: GetCommand = new GetCommand(input);

        const result = await documentClient.send(command);

        const subscription = unmarshall(result.Item) as SubscriptionDO;

        console.log(`Finish get subscription ${subscription}`);

        return subscription;
    }


    async put(subscription: SubscriptionDO): Promise<void> {

        console.log(`Start put subscription ${subscription}`);
        
        const input: PutItemInput = {
            TableName: SubscriptionTableName,
            Item: marshall(subscription)
        }

        const command: PutItemCommand = new PutItemCommand(input);

        await documentClient.send(command);

        console.log(`Finish put subscription`);

    }
} 

const subscriptionRepository: SubscriptionRepository = new SubscriptionRepositoryImpl()
export { subscriptionRepository }