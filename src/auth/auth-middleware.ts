import { Request, Response, NextFunction } from "express";
import { AuthService, authService } from "./auth-servce";

export class AuthMiddleware {

    constructor(readonly authService: AuthService) {}

    async authorizeWallet(req: Request, res: Response, next: NextFunction) {
        
        if (!req.session.siwe) {
            res.status(401).json({ message: 'You have to first sign_in' });
            return;
        }

        next()
        return
    }
}

const authMiddleware = new AuthMiddleware(authService)
export { authMiddleware }