import { Request, Response } from "express";
import { ProfileController } from "./ProfileController";
import { UpdateProfileRequest } from "./UpdateProfileRequest";
import { apiError, unknownApiError } from "@/api/ApiResponse";
import { profileService } from "@/profile/service/ProfileServiceImpl";
import { ProfileDO } from "@/profile/repository/ProfileDO";
import { GetProfileRequest } from "./GetProfileRequest";
import { toErrorResponse, toSuccessResponse } from "@/common";
import { subscriptionService } from "@/subscription/subscription-service";
import { GetProfileResponse } from "./GetProfileResponse";

export class ProfileControllerImpl implements ProfileController {

    async update(req: Request, res: Response): Promise<void> {
        try {

            const updateProfileRequest = req.body as UpdateProfileRequest;
            const profileId = updateProfileRequest.id;

            if (!profileId) {
                console.log("profileId is null");
                res.json(apiError('bad_request', 'Id not passed')).status(400);
                return
            }

            const currentProfile = await profileService.getById(profileId);
            if (!currentProfile) {
                console.log(`Profile with id ${profileId} not found`);
                res.json(apiError('not_found', 'Profile not found')).status(404);
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
            res.json(unknownApiError).status(500);
        }
    }

    async profile(req: Request, res: Response): Promise<void> {

        try {

            const { profileId } = req.body as GetProfileRequest;

            if (!profileId) {
                console.log('Error, profileId is null.');
                res
                    .send(apiError("", "Error, profileId is null."))
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
            res.json(unknownApiError).status(500);
        }
    }
}

const profileController: ProfileController = new ProfileControllerImpl();
export { profileController }