import { ProfileRepository, profileRepository } from "./profile-repository";

export interface ProfileService {

}

export class ProfileServiceImpl implements ProfileService {
    constructor(readonly profileRepository: ProfileRepository) {}
}

const profileService: ProfileService = new ProfileServiceImpl(profileRepository)
export { profileService }