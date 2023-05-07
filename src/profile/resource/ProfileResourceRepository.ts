import { Image } from "@/s3/image"

export interface ProfileResourceRepository {

    getImage(id: string): Promise<Image | undefined>

    save(base64Image: string): Promise<string>

    update(id: string, newBase64Image: string): Promise<void>

}