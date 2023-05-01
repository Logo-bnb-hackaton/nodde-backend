import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3";
import { randomUUID } from "crypto";
import md5 from "md5";

export const base64StringToBuffer = async (base64String: string): Promise<Buffer> => {
    return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64")
}

export function s3DataToBase64String(s3Data: any): string {
    return `data:${s3Data.ContentType};base64,${s3Data.Body.toString('base64')}`;
}

export async function getObjById(bucket: string, id: string): Promise<any> {
    console.log(`Get object from s3. Bucket: ${bucket}, key: ${id}`)
    const input = {
        Bucket: bucket,
        Key: id
    }

    return s3.send(new GetObjectCommand(input)).then(data => {return {id: id, data: data}})
}

export async function saveNewImage(bucket: string, base64Image: string) {
    console.log(`saveNewImage`)
    const data = await base64StringToBuffer(base64Image)
    const type = base64Image.split(";")[0].split("/")[1]
    const key = randomUUID()
    const input = {
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentEncoding: "base64",
        ContentType: `image/${type}`
    }

    await s3.send(new PutObjectCommand(input))

    return key
}

export async function updateImage(bucket: string, oldImageId: string, newImage: any) {

    if (!oldImageId) {
        return await saveNewImage(bucket, newImage.base64Image)
    }

    if (oldImageId === newImage.id) {
        return oldImageId
    }

    console.log('Updating image');
    const newBase64Data = await base64StringToBuffer(newImage.base64Image);

    console.log(`Loading old image: ${oldImageId}`);
    const oldLogoBase64 = (await getObjById(bucket, oldImageId)).data;
    const oldBase64Image = s3DataToBase64String(oldLogoBase64);
    const oldBase64Data = Buffer.from(oldLogoBase64.Body);

    if (md5(newBase64Data) === md5(oldBase64Data) && newImage.base64Image === oldBase64Image) {
        console.log('Trying to save the same image, so skip this step');
        return oldImageId;
    } else {
        console.log(`Updating image`);
        const type = newImage.base64Image.split(';')[0].split('/')[1];
        const key = randomUUID();

        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: newBase64Data,
            ContentEncoding: 'base64',
            ContentType: `image/${type}`
        }))

        console.log(`Delete old image: ${oldImageId}`);
        await s3.send(new DeleteObjectCommand({Bucket: bucket, Key: oldImageId}))

        return key;
    }

}
