import { Request, Response } from "express";
import { AuthService, authService } from "../auth/auth-servce";
import { SiweErrorType, SiweMessage, generateNonce } from "siwe";

export interface AuthController {
    getNonce(req: Request, res: Response): Promise<void>
    signIn(req: Request, res: Response): Promise<void>
    signOut(req: Request, res: Response): Promise<void>
}

export class AuthControllerImpl implements AuthController {

    constructor(readonly authService: AuthService) {}

    async getNonce(req: Request, res: Response): Promise<void> {
        req.session.nonce = generateNonce();
        req.session.save(() => res.status(200).send(req.session.nonce).end());
    }

    async signIn(req: Request, res: Response): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const { ens, signature } = body;
            console.log(ens + " " + signature)
            if (!body.message) {
                res.status(422).json({ message: 'Expected signMessage object as body.' });
                return;
            }
    
            const message = new SiweMessage(req.body.message);
    
            const { data: fields } = await message.verify({ signature, nonce: req.session.nonce });
    
            req.session.siwe = fields;
            req.session.ens = ens;
            req.session.nonce = null;
            req.session.cookie.expires = new Date(fields.expirationTime);
            req.session.save(() =>
                res
                    .status(200)
                    .json({
                        text: req.session.siwe.address,
                        address: req.session.siwe.address,
                        ens: req.session.ens,
                    })
                    .end(),
            );
        } catch (e) {
            req.session.siwe = null;
            req.session.nonce = null;
            req.session.ens = null;
            console.error(e);
            let err = e as Error
            switch (e) {
                case SiweErrorType.EXPIRED_MESSAGE: {
                    req.session.save(() => res.status(440).json({ message: err.message }));
                    break;
                }
                case SiweErrorType.INVALID_SIGNATURE: {
                    req.session.save(() => res.status(422).json({ message: err.message }));
                    break;
                }
                default: {
                    req.session.save(() => res.status(500).json({ message: err.message }));
                    break;
                }
            }
        }
    }

    async signOut(req: Request, res: Response): Promise<void> {
        req.session.destroy(() => {
            res.status(205).send();
        });
    }

}

const authController: AuthController = new AuthControllerImpl(authService)
export { authController }