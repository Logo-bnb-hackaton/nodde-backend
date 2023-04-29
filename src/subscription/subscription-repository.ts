
export interface SubscriptionRepository {

}

const SubscriptionTableName = "Community-subscription";

export class SubscriptionRepositoryImpl implements SubscriptionRepository {

}

const subscriptionRepository: SubscriptionRepository = new SubscriptionRepositoryImpl()
export { subscriptionRepository }