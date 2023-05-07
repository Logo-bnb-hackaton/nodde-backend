import { BriefSubscriptionInfo } from "@/subscription/service/subscription-service";
import { ImageDto } from "./ImageDto";

export interface GetProfileResponse {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
    subscriptions: BriefSubscriptionInfo[],
}