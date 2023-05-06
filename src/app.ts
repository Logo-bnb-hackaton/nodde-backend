import express, {Express, Request, Response, json} from 'express';
import {authMiddleware} from './auth/auth-middleware';
import {authController} from './controller/AuthController';
import {profileController} from './controller/ProfileController';
import {subscriptionController} from './controller/SubscriptionController';
import dotenv from 'dotenv';
import {telegramController} from './controller/TelegramController';
import {SiweMessage} from 'siwe';
import Session from 'express-session';
import {SessionStore} from './store/SessionStore';
import * as console from "console";

const cors = require('cors');

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

app.use(function (req, res, next) {
    // console.log('Before:');
    // console.log('Request:');
    // console.log(req);
    // console.log(req.headers);
    // console.log('Response:');
    // console.log(res);
    // console.log(res.headers);

    const middleware = cors({
        origin: ['http://localhost:3000'],
        // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,

    });

    middleware(req, res, () => {
        // console.log('After:');
        // console.log('Request:');
        // console.log(req);
        // console.log(req.headers);
        // console.log('Response:');
        // console.log(res);
        // console.log(res.headers);
        next();
    })
});

// app.use(Session({
//     name: "siwe",
//     secret: "siwe-secret", // change to env
//     resave: false,
//     store: new SessionStore({
//         table: {
//             name: "nodde-sessions"
//         },
//         touchInterval: 30000,
//         ttl: 86400000
//     }),
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         secure: true,
//         sameSite: "none"
//     }
// }));

app.use(function (req, res, next) {
    console.log('Before:');
    console.log('Request:');
    console.log(req);
    console.log(req.headers);
    console.log('Response:');
    console.log(res);
    console.log(res.headers);

    const middleware = Session({
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
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
    });

    middleware(req, res, () => {
        console.log('After:');
        console.log('Request:');
        console.log(req);
        console.log(req.headers);
        console.log('Response:');
        console.log(res);
        console.log(res.headers);
        next();
    })
});

app.get('/', (_: Request, res: Response) => {
    res.send({
        status: "ok"
    });
});


app.get('/api/nonce', authController.getNonce);

app.post('/api/sign_in', authController.signIn);

app.post('/api/sign_out', authMiddleware.authorizeWallet, authController.signOut);

app.get('/api/me', async (req, res) => {
    if (!req.session.siwe) {
        res.status(401).json({message: 'You have to first sign_in'});
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

app.post('/profile/update', authMiddleware.authorizeWallet, profileController.update);

app.post('/profile/', authMiddleware.authorizeWallet, profileController.profile);

app.post('/subscription/update', authMiddleware.authorizeWallet, subscriptionController.update);

app.post('/subscription/', authMiddleware.authorizeWallet, subscriptionController.getSubscriptionDescription);

app.get('/telegram/get-invite-code', authMiddleware.authorizeWallet, telegramController.getInviteLink);

app.post('/telegram/generate-invite-code', authMiddleware.authorizeWallet, telegramController.generateInviteLink);

app.post('/telegram/bind-chat', authMiddleware.authorizeWallet, telegramController.bindChat);

app.get('/telegram/get-chat-binding-status', authMiddleware.authorizeWallet, telegramController.getChatBindingStatus);

app.use((_, res, _2) => {
    res.status(404).json({error: 'NOT FOUND'});
});

export {app}