import express, { Express, Request, Response } from 'express';
import { authMiddleware } from './src/auth/auth-middleware';
import { AuthenticationRequest, authController } from './src/controller/AuthController';
import { profileController } from './src/controller/ProfileController';
import { subscriptionController } from './src/controller/SubscriptionController';
import dotenv from 'dotenv';
import { authRepository } from './src/auth/auth-repository';
import serverless from 'serverless-http';
import { ApiErrorResponse } from './src/api/ApiErrorResponse';
import { ApiResponse } from './src/api/ApiResponse';

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

app.post('/profile/', authMiddleware.authorizeWallet, profileController.profile)

app.post('/subscription/update', [authMiddleware.authorizeWallet])

app.post('/subscription/', [authMiddleware.authorizeWallet])

app.listen(port, () => {
    console.log(`Server has been started on port ${port}`);
})

const server = serverless(app)
export { server }