import { NextFunction, Request, Response } from "express";
import { ProfileService, profileService } from "../profile/profile-service";

class ProfileUpdateResponse {

}

class ProfileResponse {

}

export interface ProfileController {
    update(req: Request, res: Response, next: NextFunction): void
    profile(req: Request, res: Response, next: NextFunction): void
}

export class ProfileControllerImpl implements ProfileController {
    constructor(readonly profileService: ProfileService) {}

    update(req: Request, res: Response, next: NextFunction): void {
        const { address } = req.body[0]
        
        
    }
    profile(req: Request, res: Response, next: NextFunction): void {
        throw new Error("Method not implemented.");
    }
}

const profileController: ProfileController = new ProfileControllerImpl(profileService)
export { profileController }