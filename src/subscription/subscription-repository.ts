
export interface SubscriptionRepository {

}

export const SubscriptionTableName = "Community-subscription";

export class SubscriptionRepositoryImpl implements SubscriptionRepository {

} 

const subscriptionRepository: SubscriptionRepository = new SubscriptionRepositoryImpl()
export { subscriptionRepository }