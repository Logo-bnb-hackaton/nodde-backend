import { Image } from "@/s3/image"
import { ProfileDO } from "../repository/ProfileDO"

export interface ProfileService {

    getById(id: string): Promise<ProfileDO|undefined>

    save(profile: ProfileDO): Promise<ProfileDO>

    getImage(id: string): Promise<Image|undefined>

    saveImage(base64Image: string): Promise<string>

    uploadImage(id: string, base64Image: string): Promise<string>

}