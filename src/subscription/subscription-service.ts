import { ImageDto } from "@/controller/ProfileController";
import { scanTable } from "../db/db";
import { SubscriptionDO, SubscriptionStatus, subscriptionRepository } from "./subscription-repository";
import { subscriptionResourceRepository } from "./subscription-resource-repository";
import { Image } from "@/s3/image";

export interface BriefSubscriptionInfo {
    id: string;
    status: SubscriptionStatus,
    ownerId: string;
    title: string;
    previewImage: ImageDto,
}

export interface SubscriptionService {
    getById(id: string): Promise<SubscriptionDO>
    put(subscription: SubscriptionDO): Promise<void>
    loadBriefSubscription(profileId: string): Promise<any[]>
    getImage(id: string): Promise<Image | undefined>
    saveImage(base64Image: string): Promise<string>
    uploadImage(id: string, base64Image: string): Promise<string>
}

export class SubscriptionServiceImpl implements SubscriptionService {

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


        const images = await Promise.all(subscriptions.map(s => {
            return subscriptionResourceRepository.getImage(s.previewImageId)
        }));

        return subscriptions.map(s => {
            return {
                ...s,
                previewImageId: undefined,
                previewImage: {
                    id: s.previewImageId,
                    base64Image: images.find(i => i.id === s.previewImageId).base64Data
                }
            }
        })
    }

    async getImage(id: string): Promise<Image> {
        return subscriptionResourceRepository.getImage(id);
    }

    async saveImage(base64Image: string): Promise<string> {
        return subscriptionResourceRepository.save(base64Image);
    }

    async uploadImage(id: string, base64Image: string): Promise<string> {
        await subscriptionResourceRepository.update(id, base64Image);
        return id;
    }
}

const subscriptionService: SubscriptionService = new SubscriptionServiceImpl();
export { subscriptionService }