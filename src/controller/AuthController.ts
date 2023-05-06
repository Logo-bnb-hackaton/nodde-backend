import {Request, Response} from "express";
import {SiweErrorType, SiweMessage, generateNonce} from "siwe";
import * as console from "console";

interface SignInBody {
    message: {
        domain: string,
        address: string,
        statement: string,
        uri: string,
        version: string,
        chainId: number,
        nonce: string,
        issuedAt: string,
    },
    signature: string,
}

export interface AuthController {
    getNonce(req: Request, res: Response): Promise<void>

    signIn(req: Request, res: Response): Promise<void>

    signOut(req: Request, res: Response): Promise<void>
}

export class AuthControllerImpl implements AuthController {

    constructor() {
    }

    async getNonce(req: Request, res: Response): Promise<void> {
        req.session.nonce = generateNonce();
        console.log('req with session');
        console.log(JSON.stringify(req.session));
        req.session.save(() => res.status(200).send(req.session.nonce).end());
    }

    async signIn(req: Request, res: Response): Promise<void> {
        try {
            console.log('signIn request');
            console.log(req);
            console.log(req.apiGateway.event.headers);
            const {message, signature} = req.body as SignInBody;
            if (!message) {
                res.status(422).json({message: 'Expected signMessage object as body.'});
                return;
            }

            const siweMessage = new SiweMessage(message);

            const {data: fields} = await siweMessage.verify({signature, nonce: req.session.nonce});

            console.log('fields');
            console.log(fields);
            console.log('session');
            console.log(req.session.nonce);
            console.log(req.session);

            if (fields.nonce !== req.session.nonce) {
                res.status(422).json({message: 'Invalid nonce.'});
                return;
            }

            req.session.siwe = fields;
            req.session.nonce = null;
            await req.session.save();
            res.json({ok: true});
        } catch (e) {
            req.session.siwe = null;
            req.session.nonce = null;
            req.session.ens = null;
            console.error(e);
            let err = e as Error
            switch (e) {
                case SiweErrorType.EXPIRED_MESSAGE: {
                    req.session.save(() => res.status(440).json({message: err.message}));
                    break;
                }
                case SiweErrorType.INVALID_SIGNATURE: {
                    req.session.save(() => res.status(422).json({message: err.message}));
                    break;
                }
                default: {
                    req.session.save(() => res.status(500).json({message: err.message}));
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

const authController: AuthController = new AuthControllerImpl()
export {authController}