import { OperationStatus } from "@/db/db";
import { Profile, ProfileRepository, profileRepository } from "./profile-repository";

export interface ProfileService {
    save(profile: Profile): Promise<Profile>
}

export class ProfileServiceImpl implements ProfileService {
    constructor(readonly profileRepository: ProfileRepository) {}

    async save(profile: Profile): Promise<Profile> {
        const operationStatus = await profileRepository.save(profile)
        if (operationStatus === OperationStatus.SUCCESS) {
            return profile
        }

        throw new Error("")
    }
}

const profileService: ProfileService = new ProfileServiceImpl(profileRepository)
export { profileService }