import { Request, Response } from "express";
import { ProfileService, profileService } from "@/profile/profile-service";
import { ApiResponse } from "@/api/ApiResponse";
import { BriefSubscriptionInfo, subscriptionService, SubscriptionService } from "@/subscription/subscription-service";
import { toSuccessResponse, toErrorResponse } from "@/common";
import { ProfileDO } from "@/profile/profile-repository";


export interface ImageDto {
    id: string | undefined,
    base64Image: string | undefined,
}

export interface UpdateProfileRequestDTO {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
}

export interface GetProfileResponse {
    id: string;
    title: string;
    description: string;
    logo: ImageDto,
    socialMediaLinks: string[];
    subscriptions: BriefSubscriptionInfo[],
}

export interface ProfileController {

    update(req: Request, res: Response): Promise<void>

    profile(req: Request, res: Response): Promise<void>

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

    async update(req: Request, res: Response): Promise<void> {
        try {

            const updateProfileRequest = req.body as UpdateProfileRequestDTO;
            const profileId = updateProfileRequest.id;

            if (!profileId) {
                console.log("profileId is null");
                res.send(toErrorResponse("profileId is null"));
                return
            }

            const currentProfile = await profileService.getById(profileId);
            if (!currentProfile) {
                console.log(`Profile with id ${profileId} not found`);
                res.json({
                    error: {
                        code: 'not_found',
                        message: 'Profile not found'
                    }
                }).status(404);
                return;
            }

            const updatedLogo =  await profileService.uploadImage(currentProfile?.logoId, updateProfileRequest.logo.base64Image);

            const profile: ProfileDO = {
                id: profileId,
                title: updateProfileRequest.title,
                description: updateProfileRequest.description,
                logoId: updatedLogo,
                socialMediaLinks: updateProfileRequest.socialMediaLinks,
                instant: new Date().getTime().toString(),
            }

            await profileService.save(profile);

            res.send({ status: 'success' });
        } catch (err) {
            console.error(err);
            res.json({
                error: {
                    code: 'unknown_error',
                    message: 'Oops. Something went wrong'
                }
            }).status(500);
        }
    }

    async profile(req: Request, res: Response): Promise<void> {

        try {

            const { profileId } = req.body as LoadProfileBody;

            if (!profileId) {
                console.log('Error, profileId is null.');
                res
                    .send(ApiResponse.error("", "Error, profileId is null."))
                    .status(400)
                return
            }

            const profile = await profileService.getById(profileId);

            if (!profile) {
                console.log(`Can't find profile with profileId: ${profileId}`);
                res.send(toErrorResponse(`Can't find profile with profileId: ${profileId}`));
                return
            }

            const logo = await profileService.getImage(profile.logoId);
            const subscriptions = await subscriptionService.loadBriefSubscription(profileId);

            const response: GetProfileResponse = {
                id: profile.id,
                title: profile.title,
                description: profile.description,
                socialMediaLinks: profile.socialMediaLinks,
                logo: {
                    id: profile.logoId,
                    base64Image: logo.base64Data
                },
                subscriptions: subscriptions
            }

            res.send(toSuccessResponse(response))

        } catch (err) {
            console.error(err);
            res.json({
                error: {
                    code: 'unknown_error',
                    message: 'Oops. Something went wrong'
                }
            }).status(500);
        }
    }
}

const profileController: ProfileController = new ProfileControllerImpl(profileService, subscriptionService)
export { profileController }