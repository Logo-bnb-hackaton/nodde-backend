import { NewSubscriptionEvent } from "./NewSubscriptionEvent";

export interface SubscriptionContractService {

    findValidSubscription(ownerId: string, subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>>

}