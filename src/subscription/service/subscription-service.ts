import {ImageDto} from "@/controller/profile/ImageDto";
import {scanTable} from "@/db/db";
import {SubscriptionDO, SubscriptionStatus, subscriptionRepository} from "../repository/subscription-repository";
import {subscriptionResourceRepository} from "../resource/subscription-resource-repository";
import {Image} from "@/s3/image";
import * as console from "console";

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

    changeSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<void>

    isStatusTransitionAllowed(oldStatus: SubscriptionStatus, newStatus: SubscriptionStatus): boolean
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

    async changeSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<void> {

        const subscription = await this.getById(id);

        const updatedSubscription: SubscriptionDO = {
            ...subscription,
            status: status
        };

        if (this.isStatusTransitionAllowed(subscription.status, status)) {
            throw new Error(`Cant change status because illegal transition ${subscription.status} -> ${status}}`);
        }

        await this.put(updatedSubscription);
    }

    isStatusTransitionAllowed(oldStatus: SubscriptionStatus, newStatus: SubscriptionStatus): boolean {

        let result: boolean;
        switch (oldStatus) {
            case "DRAFT":
                if (newStatus !== "NOT_PAID") {
                    result = false;
                }
                break;
            case "NOT_PAID":
                if (newStatus !== "DRAFT" && newStatus !== "PAYMENT_PROCESSING") {
                    result = false;
                }
                break;
            case "PAYMENT_PROCESSING":
                if (newStatus !== "NOT_PAID" && newStatus !== "UNPUBLISHED") {
                    result = false;
                }
                break;
            case "UNPUBLISHED":
                if (newStatus !== "PUBLISHED") {
                    result = false;
                }
                break;
            case "PUBLISHED":
                if (newStatus !== "UNPUBLISHED") {
                    result = false;
                }
                break;
            default:
                result = true;
        }

        if (!result) {
            console.log(`Cant change status because illegal transition ${oldStatus} -> ${newStatus}}`);
        }

        return result
    }
}

const subscriptionService: SubscriptionService = new SubscriptionServiceImpl();
export {subscriptionService}