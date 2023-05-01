import express, { Express, Request, Response } from 'express';
import { authMiddleware } from './auth/auth-middleware';
import { authController } from './controller/AuthController';
import { profileController } from './controller/ProfileController';
import { subscriptionController } from './controller/SubscriptionController';
import dotenv from 'dotenv';
import { telegramController } from './controller/TelegramController';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (_: Request, res: Response) => {
    res.send({
        status: "ok"
    });
})

app.post('/auth', authController.authenticate)

app.post('/profile/update', authMiddleware.authorizeWallet, profileController.update)

app.get('/profile/', authMiddleware.authorizeWallet, profileController.profile)

app.post('/subscription/update', authMiddleware.authorizeWallet, subscriptionController.update)

app.get('/subscription/', authMiddleware.authorizeWallet, subscriptionController.getSubscriptionDescription)

app.get('/telegram/get-invite-link', authMiddleware.authorizeWallet, telegramController.getInviteLink)

app.post('/telegram/generate-invite-link', authMiddleware.authorizeWallet, telegramController.generateInviteLink)

app.post('/telegram/bind-chat', authMiddleware.authorizeWallet, telegramController.bindChat)

app.listen(port, () => {
    console.log(`Server has been started on port ${port}`);
})

export { app }