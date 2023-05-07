import { ProfileDO, ProfileRepository, profileRepository } from "./profile-repository";

export interface ProfileService {
    getById(id: string): Promise<ProfileDO>
    save(profile: ProfileDO): Promise<ProfileDO>
}

export class ProfileServiceImpl implements ProfileService {
    constructor(readonly profileRepository: ProfileRepository) {}

    async getById(id: string): Promise<ProfileDO|undefined> {
        return profileRepository.getById(id);
    }

    async save(profile: ProfileDO): Promise<ProfileDO> {
        await profileRepository.put(profile);
        return profile;
    }
}

const profileService: ProfileService = new ProfileServiceImpl(profileRepository)
export { profileService }