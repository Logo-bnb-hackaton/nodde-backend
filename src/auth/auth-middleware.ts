import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth-servce";
import { ApiErrorResponse } from "../api/ApiErrorResponse";

export class AuthMiddleware {

    constructor(readonly authService: AuthService) {}

    authorizeWallet(req: Request, res: Response, next: NextFunction) {
        
        let isAuthorized = this.authService.isAuthorized(req)

        if (!isAuthorized) {
            console.log(`Unauthorized request ${req}`)
            return res
                .status(403)
                .send(new ApiErrorResponse("00001", "User is unauthorized"))
        }

        next()
    }
}