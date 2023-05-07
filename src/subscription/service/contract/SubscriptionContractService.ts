import { NewSubscriptionEvent } from "./NewSubscriptionEvent";

export interface SubscriptionContractService {

    findValidSubscription(subscriptionId: string, address: string): Promise<Array<NewSubscriptionEvent>>

}