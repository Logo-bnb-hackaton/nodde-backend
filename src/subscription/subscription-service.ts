import { scanTable } from "../db/db";
import { getObjById, s3DataToBase64String } from "../s3/image";
import { SubscriptionDO, SubscriptionRepository, subscriptionRepository } from "./subscription-repository";



export interface SubscriptionService {
    getById(id: string): Promise<SubscriptionDO>
    put(subscription: SubscriptionDO): Promise<void>
    loadBriefSubscription(profileId: string): Promise<any[]>
}

export class SubscriptionServiceImpl implements SubscriptionService {
    constructor(readonly subscriptionRepository: SubscriptionRepository) {}

    
    getById(id: string): Promise<SubscriptionDO> {
        return subscriptionRepository.getById(id);
    }    

    put(subscription: SubscriptionDO): Promise<void> {
        return subscriptionRepository.put(subscription);
    }
    
    
    async loadBriefSubscription(profileId: string): Promise<any[]> {
        console.log(`Loading brief subscription info for profile ${profileId}`)
        const subscriptions = (await scanTable("Community-subscription"))
            .filter(s => s.ownerId === profileId)
            .map(s => ({
                id: s.id,
                status: s.status,
                ownerId: s.ownerId,
                title: s.title,
                previewImageId: s.previewImageId,
            }))

        if (subscriptions.length === 0) {
            console.log('subscriptions not found')
            return []
        }    

        console.log('Loading images for subscriptions')
        const images = await Promise.all(subscriptions.map(s => getObjById("community-profile-images-1r34goy", s.previewImageId)));

        return subscriptions.map(s => {
            return {
                ...s,
                previewImageId: undefined,
                previewImage: {
                    id: s.previewImageId,
                    base64Image: s3DataToBase64String(images.find(i => i.id === s.previewImageId).data)
                }
            }
        })
    }
}

const subscriptionService: SubscriptionService = new SubscriptionServiceImpl(subscriptionRepository)
export { subscriptionService }