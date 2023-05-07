import {documentClient} from "@/db/dynamo";
import {GetItemCommand, PutItemCommand, PutItemCommandInput} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {GetItemCommandInput} from "@aws-sdk/client-dynamodb/dist-types/commands/GetItemCommand";


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

        const input: GetItemCommandInput = {
            TableName: SubscriptionTableName,
            Key: marshall({id: id})
        }

        const result = await documentClient.send(new GetItemCommand(input));

        if (!result.Item) {
            console.log(`Subscription not found ${id}`);
            return undefined;
        }

        const subscription = unmarshall(result.Item) as SubscriptionDO;

        console.log(`Finish get subscription ${subscription}`);

        return subscription;
    }


    async put(subscription: SubscriptionDO): Promise<void> {

        console.log(`Start put subscription ${subscription}`);

        const input: PutItemCommandInput = {
            TableName: SubscriptionTableName,
            Item: marshall(subscription)
        }

        await documentClient.send(new PutItemCommand(input));

        console.log(`Finish put subscription`);

    }
}

const subscriptionRepository: SubscriptionRepository = new SubscriptionRepositoryImpl()
export {subscriptionRepository}