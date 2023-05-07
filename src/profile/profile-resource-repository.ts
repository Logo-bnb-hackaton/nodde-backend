import { s3 } from "@/s3/s3";
import { GetObjectCommand, GetObjectCommandInput, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const ProfileImageBucket = "community-profile-images-1r34goy";

export interface Image {
    id: string,
    base64Data: string
}

export interface ProfileResourceRepository {

    getImage(id: string): Promise<Image|undefined>

    save(base64Image: string): Promise<string>

    update(id: string, newBase64Image: string): Promise<void>

}

class ProfileResourceRepositoryImpl implements ProfileResourceRepository {

    async getImage(id: string): Promise<Image|undefined> {

        console.log(`Start getting image with ${id}`);
        
        const input: GetObjectCommandInput = {
            Bucket: ProfileImageBucket,
            Key: id
        }

        const command: GetObjectCommand = new GetObjectCommand(input);

        const result = await s3.send(command);

        if (!result.Body) {
            console.log(`Can't find image with id ${id}`);
            return undefined;
        }

        console.log(`Found image with id ${id}`);

        return {
            id: id,
            base64Data: `data:${result.ContentType};base64,${result.Body.transformToString('base64')}`
        }
    }
    
    async save(base64Image: string): Promise<string> {

        console.log(`Start saving new image with ${base64Image.substring(0, 20)}`);

        const type: string = base64Image.substring("data:image/".length, base64Image.indexOf(";base64"));

        const input: PutObjectCommandInput = {
            Bucket: ProfileImageBucket,
            Key: randomUUID().toString(),
            Body: this.base64StringToBuffer(base64Image),
            ContentEncoding: 'base64',
            ContentType: `image/${type}`
        };

        const command: PutObjectCommand = new PutObjectCommand(input);

        await s3.send(command);

        console.log(`New image saved ${input.Key}`);

        return input.Key;
    }

    private base64StringToBuffer(base64String: string): Buffer {
        return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
    }

    async update(id: string, newBase64Image: string): Promise<void> {

        console.log(`Start updating image with id ${id}`);
        
        const currentImage = await this.getImage(id);
        if (!currentImage) {
            console.log(`No image found for id ${id}`);
            return;
        }

        if (newBase64Image === currentImage.base64Data) {
            console.log(`Old and new image for id ${id} are equal`);
            return;
        }

        const type: string = newBase64Image.substring("data:image/".length, newBase64Image.indexOf(";base64"));

        const input: PutObjectCommandInput = {
            Bucket: ProfileImageBucket,
            Key: id,
            Body: this.base64StringToBuffer(newBase64Image),
            ContentEncoding: 'base64',
            ContentType: `image/${type}`
        };

        const command: PutObjectCommand = new PutObjectCommand(input);

        await s3.send(command);

        console.log(`Finish updating image with id ${id}`);
    }
}

const profileResourceRepository: ProfileResourceRepository = new ProfileResourceRepositoryImpl();
export { profileResourceRepository }