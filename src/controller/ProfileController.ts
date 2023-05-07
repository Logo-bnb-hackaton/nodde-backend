import {NextFunction, Request, Response} from "express";
import {ProfileService, profileService} from "@/profile/profile-service";
import {ApiResponse} from "@/api/ApiResponse";
import {getObjById, s3DataToBase64String, updateImage} from "@/s3/image";
import {OperationStatus, loadByNId, putItem, loadBySId} from "@/db/db";
import {subscriptionService, SubscriptionService} from "@/subscription/subscription-service";
import {toSuccessResponse, toErrorResponse, ProfileTableName} from "@/common";
import * as console from "console";
import { SubscriptionStatus } from "@/subscription/subscription-repository";


export interface ImageDto {
    id: string | undefined,
    base64Image: string | undefined,
}

export interface ProfileDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
    subscriptions: BriefSubscriptionInfo[],
}

export interface UpdateProfileRequestDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
}

export interface BriefSubscriptionInfo {
    id: string;
    status: SubscriptionStatus,
    ownerId: string;
    title: string;
    previewImage: ImageDto,
}

export interface ProfileController {
    update(req: Request, res: Response, next: NextFunction): Promise<void>

    profile(req: Request, res: Response, next: NextFunction): Promise<void>
}

interface LoadProfileBody {
    profileId: string
}

export class ProfileControllerImpl implements ProfileController {
    constructor(
        readonly profileService: ProfileService,
        readonly subscriptionService: SubscriptionService
    ) {
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        const newProfileData = JSON.parse(Buffer.from(req.body).toString())
        const profileId = newProfileData.id
        if (!profileId) {
            console.log("profileId is null");
            res.send(toErrorResponse("profileId is null"));
            return
        }

        const oldProfile = (await loadByNId(ProfileTableName, profileId)).item;
        const logoS3Id = await updateImage(ProfileImageBucket, oldProfile?.logoId, newProfileData.logo)

        const profile = {
            id: profileId,
            title: newProfileData.title,
            description: newProfileData.description,
            logoId: logoS3Id,
            socialMediaLinks: newProfileData.socialMediaLinks,
            instant: new Date().getTime().toString(),
        }

        console.log('Updating profile');

        const status = await putItem({
            TableName: ProfileTableName,
            Item: profile
        })

        if (status === OperationStatus.SUCCESS) {
            res.send({status: "success"})
        } else {
            res.send({
                status: "error",
                errorMessage: "internal error"
            });
        }

        next()
    }

    async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log(`Start processing get porfile request`);
        console.log(req);

        const {profileId} = req.body as LoadProfileBody;
        console.log(`profile id: ${profileId}`);

        if (!profileId) {
            console.log('Error, profileId is null.');
            res
                .send(ApiResponse.error("", "Error, profileId is null."))
                .status(400)
            return
        }

        const profile = (await loadBySId("Community-profile", profileId)).item
        console.log(`profile: ${profile}`);

        if (!profile) {
            console.log(`Can't find profile with profileId: ${profileId}`);
            res.send(toErrorResponse(`Can't find profile with profileId: ${profileId}`));
            return
        }

        const logoPromise = getObjById(ProfileImageBucket, profile.logoId)
            .then(res => {
                profile.logo = {
                    id: profile.logoId,
                    base64Image: s3DataToBase64String(res.data)
                }
                profile.logoId = undefined
            });

        const subscriptionsPromise = await subscriptionService.loadBriefSubscription(profileId).then(s => profile.subscriptions = s);

        await Promise.all([logoPromise, subscriptionsPromise])

        res.send(toSuccessResponse(profile))

        next()
    }
}

const profileController: ProfileController = new ProfileControllerImpl(profileService, subscriptionService)
export {profileController}