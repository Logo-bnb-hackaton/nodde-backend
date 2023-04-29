import { SubscriptionRepository, subscriptionRepository } from "./subscription-repository";

export interface SubscriptionService {

}

export class SubscriptionServiceImpl implements SubscriptionService {
    constructor(readonly subscriptionRepository: SubscriptionRepository) {}
}

const subscriptionService = new SubscriptionServiceImpl(subscriptionRepository)
export { subscriptionService }