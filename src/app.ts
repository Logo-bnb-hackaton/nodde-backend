import express, { Express, Request, Response, json } from 'express';
import { authMiddleware } from './auth/auth-middleware';
import { authController } from './controller/AuthController';
import { profileController } from './controller/ProfileController';
import { subscriptionController } from './controller/SubscriptionController';
import dotenv from 'dotenv';
import { telegramController } from './controller/TelegramController';
import { SiweMessage } from 'siwe';
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


app.get('/api/nonce', authController.getNonce);

app.post('/api/sign_in', authController.signIn);

app.post('/api/sign_out', authMiddleware.authorizeWallet, authController.signOut);

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