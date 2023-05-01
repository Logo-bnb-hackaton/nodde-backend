import { NextFunction, Request, Response } from "express"
import { ProfileTableName, toErrorResponse, toSuccessResponse } from "../common";
import { getObjById, s3DataToBase64String, updateImage } from "../s3/image";
import { loadByNId, put } from "../db/db";
import { SubscriptionTableName } from "@/subscription/subscription-repository";


export interface SubscriptionController {

    getSubscriptionDescription(req: Request, res: Response, next: NextFunction): Promise<void>

    update(req: Request, res: Response, next: NextFunction): Promise<void>

}

export class SubscriptionControllerImpl implements SubscriptionController {

    async getSubscriptionDescription(req: Request, res: Response, next: NextFunction): Promise<void> {

        const body = JSON.parse(Buffer.from(req.body).toString())

        const subId = body.subscriptionId;
        if (!subId) {
            console.log(`Error, subId is null: ${subId}`);
            res.send(toErrorResponse(`Error, subId is null: ${subId}`));
            return
        }
    
        const subscription = (await loadByNId(SubscriptionTableName, subId)).item;
    
        if (!subscription) {
            console.log(`Can't find subscription with subscriptionId: ${subId}`);
            res.send(toErrorResponse(`Can't find subscription with subscriptionId: ${subId}`));
            return
        }
    
        const mainImageBase64 = (await getObjById(SubscriptionImageBucket, subscription.mainImageId)).data;
        const previewImageBase64 = (await getObjById(SubscriptionImageBucket, subscription.previewImageId)).data;
    
        subscription.mainImage = {
            id: subscription.mainImageId,
            base64Image: s3DataToBase64String(mainImageBase64)
        }
        subscription.mainImageId = undefined;
    
        subscription.previewImage = {
            id: subscription.previewImageId,
            base64Image: s3DataToBase64String(previewImageBase64)
        }
        subscription.previewImageId = undefined;
    
        console.log('Done');
        res.send(toSuccessResponse(subscription));

        next()
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {

        const newSubData = JSON.parse(Buffer.from(req.body).toString());
        const subId = newSubData.id;
        if (!subId) {
            console.log("subId is null");
            res.send({
                status: "error",
                errorMessage: "subId is null"
            });
            return
        }
    
        const oldSub = (await loadByNId(ProfileTableName, subId)).item;
        const mainImageS3Id = await updateImage(SubscriptionImageBucket, oldSub?.mainImageId, newSubData.mainImage)
        const previewImgS3Id = await updateImage(SubscriptionImageBucket, oldSub?.previewImageId, newSubData.previewImage)
    
        const subscription = {
            id: subId,
            ownerId: newSubData.ownerId,
            status: newSubData.status,
            title: newSubData.title,
            description: newSubData.description,
            mainImageId: mainImageS3Id,
            previewImageId: previewImgS3Id,
            price: newSubData.price,
            coin: newSubData.coin,
            instant: new Date().getTime().toString(),
        }
    
        console.log('Updating subscription');
        try {

            put({
                TableName: SubscriptionTableName,
                Item: {
                    id: {
                        S: subscription.id
                    },
                    ownerId: {
                        S: subscription.ownerId
                    },
                    status: {
                        S: subscription.status
                    },
                    title: {
                        S: subscription.title
                    },
                    description: {
                        S: subscription.description
                    },
                    mainImageId: {
                        S: subscription.mainImageId != undefined ? subscription.mainImageId : ""
                    },
                    previewImageId: {
                        S: subscription.previewImageId != undefined ? subscription.previewImageId : ""
                    }, 
                    price: {
                        N: subscription.price
                    },
                    coin: {
                        S: subscription.coin
                    },
                    instant: {
                        N: subscription.instant
                    }
                },
            })
    
            res.send({status: "success"});
        } catch (e) {
            console.error(e)
            let errorMessage = "internal error"
            res.send({
                status: "error",
                errorMessage: errorMessage
            });
        } finally {
            console.log("Subscription was updated."); 
        }

        next()
    }
    
}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export { subscriptionController }