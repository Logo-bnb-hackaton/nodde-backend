import { ProfileService, profileService } from "../profile/profile-service";

class ProfileUpdateRequest {

}

class ProfileUpdateResponse {

}

export interface ProfileController {

}

export class ProfileControllerImpl implements ProfileController {
    constructor(readonly profileService: ProfileService) {}
}

const profileController: ProfileControllerImpl = new ProfileControllerImpl(profileService)
export { profileController }