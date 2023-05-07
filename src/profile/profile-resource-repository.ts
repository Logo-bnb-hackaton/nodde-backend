import { Image, getImage, save, update } from "@/s3/image";

const ProfileImageBucket = "community-profile-images-1r34goy";

export interface ProfileResourceRepository {

    getImage(id: string): Promise<Image | undefined>

    save(base64Image: string): Promise<string>

    update(id: string, newBase64Image: string): Promise<void>

}

class ProfileResourceRepositoryImpl implements ProfileResourceRepository {

    async getImage(id: string): Promise<Image | undefined> {
        return getImage(ProfileImageBucket, id);
    }

    async save(base64Image: string): Promise<string> {
        return save(ProfileImageBucket, base64Image);
    }

    async update(id: string, newBase64Image: string): Promise<void> {
        return update(ProfileImageBucket, id, newBase64Image);
    }
}

const profileResourceRepository: ProfileResourceRepository = new ProfileResourceRepositoryImpl();
export {profileResourceRepository}