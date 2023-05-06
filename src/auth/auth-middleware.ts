import {Request, Response, NextFunction} from "express";
import * as console from "console";

export class AuthMiddleware {

    constructor() {
    }

    async authorizeWallet(req: Request, res: Response, next: NextFunction) {
        console.log('AuthMiddleware')
        console.log(req);
        console.log(req.session);
        console.log(req);

        if (!req.session.siwe) {
            res.status(401).json({message: 'You have to first sign_in'});
            return;
        }

        next()
        return
    }
}

const authMiddleware = new AuthMiddleware()
export {authMiddleware}