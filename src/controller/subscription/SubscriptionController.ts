import {Request, Response} from "express"
import {toErrorResponse, toSuccessResponse} from "@/common";
import {SubscriptionDO, SubscriptionStatus} from "@/subscription/repository/subscription-repository";
import {subscriptionService} from "@/subscription/service/subscription-service";
import {subscriptionResourceRepository} from "@/subscription/resource/subscription-resource-repository";
import {apiResponse, unknownApiError} from "@/api/ApiResponse";
import {ImageDto} from "@/controller/profile/ImageDto";

export interface GetSubscriptionDescriptionRequest {
    subscriptionId: string
}

export interface GetSubscriptionDescriptionResponse {
    id: string,
    coin: string,
    description: string,
    instant: string,
    ownerId: string,
    price: string,
    status: SubscriptionStatus,
    title: string
    mainImage: ImageDto,
    previewImage: ImageDto
}

export interface UpdateSubscriptionDTO {
    id: string;
    ownerId: string;
    status: SubscriptionStatus;
    title: string;
    description: string;
    mainImage: ImageDto,
    previewImage: ImageDto,
    price: string;
    coin: string;
}

export interface UpdateSubscriptionStatusDTO {
    id: string,
    status: SubscriptionStatus
}

export interface SubscriptionController {

    getSubscriptionDescription(req: Request, res: Response): Promise<void>

    update(req: Request, res: Response): Promise<void>

    updateStatus(req: Request, res: Response): Promise<void>
}

export class SubscriptionControllerImpl implements SubscriptionController {

    async getSubscriptionDescription(req: Request, res: Response): Promise<void> {
        try {

            const body = req.body as GetSubscriptionDescriptionRequest;

            const subscriptionId = body.subscriptionId;
            if (!subscriptionId) {
                console.log(`Error, id is null: ${subscriptionId}`);
                res.send(toErrorResponse(`Error, id is null: ${subscriptionId}`));
                return
            }

            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            const mainImageBase64 = (await subscriptionResourceRepository.getImage(subscription.mainImageId)).base64Data;
            const previewImageBase64 = (await subscriptionResourceRepository.getImage(subscription.previewImageId)).base64Data;

            const response: GetSubscriptionDescriptionResponse = {
                id: subscription.id,
                coin: subscription.coin,
                description: subscription.description,
                instant: subscription.instant,
                ownerId: subscription.ownerId,
                price: subscription.price,
                status: subscription.status,
                title: subscription.title,
                mainImage: {
                    id: subscription.mainImageId,
                    base64Image: mainImageBase64
                },
                previewImage: {
                    id: subscription.previewImageId,
                    base64Image: previewImageBase64
                }
            }

            res.send(toSuccessResponse(response));

        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }

    }

    async update(req: Request, res: Response): Promise<void> {

        try {

            const updateSubscriptionRequest = req.body as UpdateSubscriptionDTO;

            const subscriptionId = updateSubscriptionRequest.id;
            if (!subscriptionId) {
                console.log("id is null");
                res.send({
                    status: "error",
                    errorMessage: "subId is null"
                });
                return;
            }

            const oldSubscription = await subscriptionService.getById(subscriptionId);
            if (!oldSubscription) {
                res
                    .json({
                        error: {
                            code: 'not_found',
                            message: 'Subscription not found'
                        }
                    })
                    .status(404)
            }

            const mainImageS3Id = await subscriptionService.uploadImage(oldSubscription.mainImageId, updateSubscriptionRequest.mainImage.base64Image);
            const previewImgS3Id = await subscriptionService.uploadImage(oldSubscription.previewImageId, updateSubscriptionRequest.previewImage.base64Image);

            const subscriptionForUpdate: SubscriptionDO = {
                id: subscriptionId,
                subscriptionId: '123', // todo fix it later
                ownerId: updateSubscriptionRequest.ownerId,
                status: updateSubscriptionRequest.status,
                title: updateSubscriptionRequest.title,
                description: updateSubscriptionRequest.description,
                mainImageId: mainImageS3Id,
                previewImageId: previewImgS3Id,
                price: updateSubscriptionRequest.price,
                coin: updateSubscriptionRequest.coin,
                instant: new Date().getTime().toString(),
            }

            await subscriptionService.put(subscriptionForUpdate)

            res.json(apiResponse({status: 'success'}));
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    // todo fix it later
    async updateStatus(req: Request, res: Response): Promise<void> {
        try {
            const updateSubscriptionRequest = req.body as UpdateSubscriptionStatusDTO;
            const subscriptionId = updateSubscriptionRequest.id;
            if (!subscriptionId) {
                console.log("id is null");
                res.send({
                    status: "error",
                    errorMessage: "subId is null"
                });
                return;
            }

            const oldSubscription = await subscriptionService.getById(subscriptionId);
            if (!oldSubscription) {
                res
                    .json({
                        error: {
                            code: 'not_found',
                            message: 'Subscription not found'
                        }
                    })
                    .status(404)
            }

            const subscriptionForUpdate: SubscriptionDO = {
                ...oldSubscription,
                status: updateSubscriptionRequest.status,
            }

            await subscriptionService.put(subscriptionForUpdate);

            res.json(apiResponse({status: 'success'}));
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }


}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export {subscriptionController}