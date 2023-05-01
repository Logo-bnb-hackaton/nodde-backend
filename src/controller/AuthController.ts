import { NextFunction, Request, Response } from "express";
import { AuthService, authService } from "../auth/auth-servce";
import { toErrorResponse } from "../common";

export interface AuthController {
    authenticate(req: Request, res: Response, next: NextFunction): Promise<void>
}

export class AuthControllerImpl implements AuthController {

    constructor(readonly authService: AuthService) { }

    async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let { address } = req.body
            let authNonce = await this.authService.createNewNonce(address)
            res
                .send({
                    nonce: authNonce.nonce,
                    expired_id: authNonce.expiredIn
                })
                .status(200)

            next()
        } catch (error) {
            console.log(error)
            res
                .send(toErrorResponse("Bad request"))
                .status(400)
        }
    }
}

const authController: AuthController = new AuthControllerImpl(authService)
export { authController }