import { OperationStatus } from "@/db/db";
import { ProfileDO, ProfileRepository, profileRepository } from "./profile-repository";

export interface ImageDto {
    id: string | undefined,
    base64Image: string | undefined,
}

export interface ProfileDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
    subscriptions: BriefSubscriptionInfo[],
}

export interface UpdateProfileDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
}

export interface UpdateSubscriptionDTO {
    id: string;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImage: ImageDto,
    previewImage: ImageDto,
    price: string;
    coin: string;
}

export interface BriefSubscriptionInfo {
    id: string;
    status: SubscriptionStatus,
    ownerId: string;
    title: string;
    previewImage: ImageDto,
}

export type SubscriptionStatus = 'DRAFT' | 'UNPUBLISHED' | 'PUBLISHED';

export interface ProfileService {
    save(profile: ProfileDO): Promise<ProfileDO>
}

export class ProfileServiceImpl implements ProfileService {
    constructor(readonly profileRepository: ProfileRepository) {}

    async save(profile: ProfileDO): Promise<ProfileDO> {
        const operationStatus = await profileRepository.save(profile)
        if (operationStatus === OperationStatus.SUCCESS) {
            return profile
        }

        throw new Error("")
    }
}

const profileService: ProfileService = new ProfileServiceImpl(profileRepository)
export { profileService }