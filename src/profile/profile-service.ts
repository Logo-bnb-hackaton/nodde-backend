import { Image } from "@/s3/image";
import { ProfileDO, profileRepository } from "./profile-repository";
import { profileResourceRepository } from "./profile-resource-repository";

export interface ProfileService {

    getById(id: string): Promise<ProfileDO|undefined>

    save(profile: ProfileDO): Promise<ProfileDO>

    getImage(id: string): Promise<Image|undefined>

    saveImage(base64Image: string): Promise<string>

    uploadImage(id: string, base64Image: string): Promise<string>

}

export class ProfileServiceImpl implements ProfileService {

    async getById(id: string): Promise<ProfileDO|undefined> {
        return profileRepository.getById(id);
    }

    async save(profile: ProfileDO): Promise<ProfileDO> {
        await profileRepository.put(profile);
        return profile;
    }

    async getImage(id: string): Promise<Image> {
        return profileResourceRepository.getImage(id);
    }

    async saveImage(base64Image: string): Promise<string> {
       return profileResourceRepository.save(base64Image);
    }

    async uploadImage(id: string, base64Image: string): Promise<string> {
        await profileResourceRepository.update(id, base64Image);
        return id;
    }
}

const profileService: ProfileService = new ProfileServiceImpl();
export { profileService }