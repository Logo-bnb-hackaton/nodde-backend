import { OperationStatus } from "@/db/db";
import { ProfileDO, ProfileRepository, profileRepository } from "./profile-repository";

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