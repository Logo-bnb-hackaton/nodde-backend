import express, { Express, Request, Response } from 'express';
import { authMiddleware } from './src/auth/auth-middleware';
import { authController } from './src/controller/AuthController';
import { profileController } from './src/controller/ProfileController';
import { subscriptionController } from './src/controller/SubscriptionController';
import dotenv from 'dotenv';
import { authRepository } from './src/auth/auth-repository';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (_: Request, res: Response) => {
    res.send({
        status: "ok"
    });
})

app.post('/auth', (req: Request, res: Response) => {
    authController.authenticate()
})

app.post('/profile/update', [authMiddleware.authorizeWallet])

app.post('/profile/', [authMiddleware.authorizeWallet])

app.post('/subscription/update', [authMiddleware.authorizeWallet])

app.post('/subscription/', [authMiddleware.authorizeWallet])

app.listen(port, () => {
    console.log(`Server has been started on port ${port}`);
})