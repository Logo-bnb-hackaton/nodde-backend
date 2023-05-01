import { NextFunction, Request, Response } from "express";
import { AuthService, authService } from "../auth/auth-servce";

export interface AuthController {
    authenticate(req: Request, res: Response, next: NextFunction): Promise<void>
}

export class AuthControllerImpl implements AuthController {

    constructor(readonly authService: AuthService) { }

    async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        let { address } = req.body[0]
        let authNonce = await this.authService.createNewNonce(address)
        res
            .send({
                nonce: authNonce.nonce,
                expired_id: authNonce.expiredIn
            })
            .status(200)
        
        next()
    }
}

const authController: AuthController = new AuthControllerImpl(authService)
export { authController }