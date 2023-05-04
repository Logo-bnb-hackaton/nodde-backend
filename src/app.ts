import express, { Express, Request, Response, json } from 'express';
import { authMiddleware } from './auth/auth-middleware';
import { authController } from './controller/AuthController';
import { profileController } from './controller/ProfileController';
import { subscriptionController } from './controller/SubscriptionController';
import dotenv from 'dotenv';
import { telegramController } from './controller/TelegramController';
import { SiweErrorType, SiweMessage, generateNonce } from 'siwe';
import Session from 'express-session';
import { SessionStore } from './store/SessionStore';


dotenv.config();

declare module 'express-session' {
    interface SessionData {
        siwe: SiweMessage;
        nonce: string;
        ens: string;
        updated: boolean;
    }
}

const app: Express = express();
app.use(json());

app.use(Session({
    name: "siwe",
    secret: "siwe-secret", // change to env
    resave: false,
    store: new SessionStore({
        table: {
            name: "nodde-sessions"
        },
        touchInterval: 30000,
        ttl: 86400000
    }),
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true }
}))

app.get('/', (_: Request, res: Response) => {
    res.send({
        status: "ok"
    });
})


app.get('/api/nonce', async (req, res) => {
    req.session.nonce = generateNonce();
    req.session.save(() => res.status(200).send(req.session.nonce).end());
});

app.get('/api/me', async (req, res) => {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    res.status(200)
        .json({
            text: req.session.siwe.address,
            address: req.session.siwe.address,
            ens: req.session.ens,
        })
        .end();
});


app.post('/api/sign_in', async (req, res) => {
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
});

app.post('/api/sign_out', async (req, res) => {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }

    req.session.destroy(() => {
        res.status(205).send();
    });
});

app.post('/auth', authController.authenticate)

app.post('/profile/update', authMiddleware.authorizeWallet, profileController.update)

app.get('/profile/', authMiddleware.authorizeWallet, profileController.profile)

app.post('/subscription/update', authMiddleware.authorizeWallet, subscriptionController.update)

app.get('/subscription/', authMiddleware.authorizeWallet, subscriptionController.getSubscriptionDescription)

app.get('/telegram/get-invite-code', authMiddleware.authorizeWallet, telegramController.getInviteLink)

app.post('/telegram/generate-invite-code', authMiddleware.authorizeWallet, telegramController.generateInviteLink)

app.post('/telegram/bind-chat', authMiddleware.authorizeWallet, telegramController.bindChat)

app.get('/telegram/get-chat-binding-status', authMiddleware.authorizeWallet, telegramController.getChatBindingStatus)

app.use((_, res, _2) => {
    res.status(404).json({ error: 'NOT FOUND' });
});

export { app }

const getInfuraUrl = (chainId: number) => {
    switch (chainId) {
        case 1:
            return 'https://mainnet.infura.io/v3';
        case 3:
            return 'https://ropsten.infura.io/v3';
        case 4:
            return 'https://rinkeby.infura.io/v3';
        case 5:
            return 'https://goerli.infura.io/v3';
        case 137:
            return 'https://polygon-mainnet.infura.io/v3';
    }
};