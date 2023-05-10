import { NewSubscriptionEvent } from "./NewSubscriptionEvent";
import {SubscriptionCreationEvent} from "@/subscription/service/contract/SubscriptionCreationEvent";

export interface SubscriptionContractService {

    findPayedSubscriptions(subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>>

    findSubscriptionCreations(subscriptionHexId: string): Promise<Array<SubscriptionCreationEvent>>

}