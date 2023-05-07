import { Image, getImage, save, update } from "@/s3/image";

const SubscriptionImageBucket = "community-subscription-images-321t9587g";


export interface SubscriptionResourceRepository {

    getImage(id: string): Promise<Image|undefined>

    save(base64Image: string): Promise<string>

    update(id: string, newBase64Image: string): Promise<void>

}

export class SubscriptionResourceRepositoryImpl implements SubscriptionResourceRepository {

    async getImage(id: string): Promise<Image|undefined> {
        return getImage(SubscriptionImageBucket, id);
    }
    
    async save(base64Image: string): Promise<string> {
        return save(SubscriptionImageBucket, base64Image);
    }

    async update(id: string, newBase64Image: string): Promise<void> {
        return update(SubscriptionImageBucket, id, newBase64Image);
    }
}

const subscriptionResourceRepository: SubscriptionResourceRepository = new SubscriptionResourceRepositoryImpl();
export { subscriptionResourceRepository }