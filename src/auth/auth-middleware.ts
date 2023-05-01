import { Request, Response, NextFunction } from "express";
import { AuthService, authService } from "./auth-servce";
import { ApiErrorResponse } from "../api/ApiErrorResponse";

export class AuthMiddleware {

    constructor(readonly authService: AuthService) {}

    async authorizeWallet(req: Request, res: Response, next: NextFunction) {
        
        let isAuthorized = await authService.isAuthorized(req)

        if (!isAuthorized) {
            console.log(`Unauthorized request ${req}`)
            return res
                .status(403)
                .send(new ApiErrorResponse("B-10001", "User is unauthorized"))
        }

        next()
        return
    }
}

const authMiddleware = new AuthMiddleware(authService)
export { authMiddleware }