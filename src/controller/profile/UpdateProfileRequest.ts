import { ImageDto } from "./ImageDto";

export interface UpdateProfileRequest {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
}