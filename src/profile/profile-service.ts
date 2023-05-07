import { ProfileDO, ProfileRepository, profileRepository } from "./profile-repository";

export interface ProfileService {
    save(profile: ProfileDO): Promise<ProfileDO>
}

export class ProfileServiceImpl implements ProfileService {
    constructor(readonly profileRepository: ProfileRepository) {}

    async save(profile: ProfileDO): Promise<ProfileDO> {
        await profileRepository.put(profile);
        return profile;
    }
}

const profileService: ProfileService = new ProfileServiceImpl(profileRepository)
export { profileService }