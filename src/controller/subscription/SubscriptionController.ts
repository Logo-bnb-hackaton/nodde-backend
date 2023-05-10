import {Request, Response} from "express"
import {toErrorResponse, toSuccessResponse} from "@/common";
import {SubscriptionDO, SubscriptionStatus} from "@/subscription/repository/subscription-repository";
import {subscriptionService} from "@/subscription/service/subscription-service";
import {subscriptionResourceRepository} from "@/subscription/resource/subscription-resource-repository";
import {apiError, apiResponse, unknownApiError} from "@/api/ApiResponse";
import {ImageDto} from "@/controller/profile/ImageDto";
import {PublishSubscriptionRequest} from "@/controller/subscription/PublishSubscriptionRequest";
import {UnpublishSubscriptionRequest} from "@/controller/subscription/UnpublishSubscriptionRequest";
import {ProcessPaymentRequest} from "@/controller/subscription/ProcessPaymentRequest";
import {subscriptionContractService} from "@/subscription/service/contract/SubscriptionContractServiceImpl";

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
    id: string
}


export interface SubscriptionController {

    getSubscriptionDescription(req: Request, res: Response): Promise<void>

    update(req: Request, res: Response): Promise<void>

    processPayment(req: Request, res: Response): Promise<void>

    publish(req: Request, res: Response): Promise<void>

    unpublish(req: Request, res: Response): Promise<void>
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

            let mainImageS3Id;
            let previewImgS3Id;
            if (oldSubscription) {
                mainImageS3Id = await subscriptionService.uploadImage(oldSubscription.mainImageId, updateSubscriptionRequest.mainImage.base64Image);
                previewImgS3Id = await subscriptionService.uploadImage(oldSubscription.previewImageId, updateSubscriptionRequest.previewImage.base64Image);
            } else {
                mainImageS3Id = await subscriptionService.saveImage(updateSubscriptionRequest.mainImage.base64Image);
                previewImgS3Id = await subscriptionService.saveImage(updateSubscriptionRequest.previewImage.base64Image);
            }

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

    async processPayment(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as ProcessPaymentRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }
            let status = subscription.status;
            if (status === 'UNPUBLISHED') {
                res.json({status: status});
                return;
            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "PAYMENT_PROCESSING")) {
                res.json(apiError('bad_request', `Can\'t start process payment because subscription in status ${subscription.status}`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "PAYMENT_PROCESSING");
            console.log(`Subscription ${subscriptionId} update status to PAYMENT_PROCESSING successfully`);
            status = "PAYMENT_PROCESSING";

            // Check status in blockchain
            // One more try-catch because success of responce at this steop really doesn't matter
            try {
                const createdSubscriptionEvent = await subscriptionContractService.findSubscriptionCreations(subscriptionId);
                if (createdSubscriptionEvent.length > 0) {
                    await subscriptionService.changeSubscriptionStatus(subscriptionId, "UNPUBLISHED");
                    console.log(`Subscription ${subscriptionId} update status to UNPUBLISHED successfully`);
                    status = "UNPUBLISHED";
                }
            } catch (e) {
                console.warn(e);
            }


            res.json({status: status});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async publish(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as PublishSubscriptionRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            // add owner check
//            const address = req.session.siwe.address;
//            if (subscription.ownerAddress === address) {
//                return with error
//            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "PUBLISHED")) {
                res.json(apiError('bad_request', `Can\'t publish the subscription from this ${subscription.status} status`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "PUBLISHED");
            console.log(`Subscription ${subscriptionId} successfully published`);
            res.json({status: 'success'});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

    async unpublish(req: Request, res: Response): Promise<void> {
        try {

            const request = req.body as UnpublishSubscriptionRequest;
            const subscriptionId = request.subscriptionId;
            const subscription = await subscriptionService.getById(subscriptionId);

            if (!subscription) {
                console.log(`Can't find subscription with id: ${subscriptionId}`);
                res.send(toErrorResponse(`Can't find subscription with id: ${subscriptionId}`));
                return
            }

            if (!subscriptionService.isStatusTransitionAllowed(subscription.status, "UNPUBLISHED")) {
                res.json(apiError('bad_request', `Can\'t publish the subscription from this ${subscription.status} status`)).status(400)
                return;
            }

            await subscriptionService.changeSubscriptionStatus(subscriptionId, "UNPUBLISHED");
            console.log(`Subscription ${subscriptionId} successfully published`);
            res.json({status: 'success'});
        } catch (err) {
            console.error(err);
            res.json(unknownApiError).status(500);
        }
    }

}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export {subscriptionController}