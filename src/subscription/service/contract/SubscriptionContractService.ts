import { NewSubscriptionEvent } from "./NewSubscriptionEvent";

export interface SubscriptionContractService {

    findPayedSubscriptions(subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>>

}