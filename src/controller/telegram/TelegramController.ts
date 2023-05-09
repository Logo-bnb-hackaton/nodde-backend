import {unknownApiError} from "@/api/ApiResponse";
import {getJsonFromLambdaResponse} from "@/lambda/wrap";
import {Request, Response} from "express";
import {GetChatBindingStatusRequest} from "@/controller/telegram/GetChatBindingStatusRequest";
import {BindChatRequest} from "@/controller/telegram/BindChatRequest";
import {InvokeCommandOutput} from "@aws-sdk/client-lambda";
import {telegramService} from "@/telegram/TelegramServiceImpl";
import {GetInviteLinkStatusRequest} from "@/controller/telegram/GetInviteLinkStatusRequest";
import {GenerateInviteCodeRequest} from "@/controller/telegram/GenerateInviteCodeRequest";
import * as console from "console";
import {subscriptionRepository} from "@/subscription/repository/subscription-repository";

export interface TelegramController {

    getInviteLinkStatus(req: Request, res: Response): Promise<void>

    generateInviteCode(req: Request, res: Response): Promise<void>

    bindChat(req: Request, res: Response): Promise<void>

    getChatBindingStatus(req: Request, res: Response): Promise<void>

}

export class TelegramControllerImpl implements TelegramController {

    async getInviteLinkStatus(req: Request, res: Response): Promise<void> {

        try {

            const {subscriptionId} = req.body as GetInviteLinkStatusRequest;
            const address = req.session.siwe.address;
            const serviceResponse = await telegramService.getInviteLinkStatus(address, subscriptionId);
            handleInvokeCommandOutput(res, serviceResponse);

        } catch (error) {
            console.error(error)
        }
    }

    async generateInviteCode(req: Request, res: Response): Promise<void> {

        try {

            const {subscriptionId} = req.body as GenerateInviteCodeRequest;
            const address = req.session.siwe.address;

            console.log(`Check if invite code for address ${address}  already created`);

            const invocationResult = await telegramService.generateInviteCode(address, subscriptionId);
            handleInvokeCommandOutput(res, invocationResult);

        } catch (error) {
            console.error(error);
            res.json(unknownApiError).status(500);
        }
    }

    async bindChat(req: Request, res: Response): Promise<void> {

        try {
            console.log('bindChat');
            console.log(req.body);
            const {code, subscriptionId} = req.body as BindChatRequest;
            const address = req.session.siwe.address;
            const serviceResponse = await telegramService.bindChat(code, address, subscriptionId);

            if (serviceResponse.StatusCode !== 200) {
                let body: any;
                let code = serviceResponse.StatusCode;
                if (code?.toString().startsWith("4")) {
                    body = JSON.parse(getJsonFromLambdaResponse(serviceResponse).body);
                } else {
                    body = unknownApiError;
                    code = 500;
                }
                res.json(body).status(code);
                return;
            }

            const sub = (await subscriptionRepository.getById(subscriptionId))!!;
            sub.status = 'NOT_PAID';
            console.log('Save sub');
            console.log(sub);
            await subscriptionRepository.put(sub)

            const body = JSON.parse(getJsonFromLambdaResponse(serviceResponse).body);
            res.json(body).status(200);
            return;
        } catch (error) {
            console.error(error)
            res.json(unknownApiError).status(500);

        }
    }

    async getChatBindingStatus(req: Request, res: Response): Promise<void> {

        try {
            console.log(`getChatBindingStatus`);
            console.log(req.body);
            const {subscriptionId} = req.body as GetChatBindingStatusRequest;
            const address = req.session.siwe.address;
            const invocationResult = await telegramService.getChatBindingStatus(address, subscriptionId);
            handleInvokeCommandOutput(res, invocationResult);

        } catch (error) {
            console.error(error)
            res.json(unknownApiError).status(500);
        }
    }
}

const handleInvokeCommandOutput = (res: Response, output: InvokeCommandOutput): void => {
    let response: any;
    let statusCode = output.StatusCode;

    if (200 === output.StatusCode || output.StatusCode?.toString().startsWith("4")) {
        response = JSON.parse(getJsonFromLambdaResponse(output).body);
        console.log(`response ${response}`);
    } else {
        response = unknownApiError;
        statusCode = 500;
    }

    res.json(response).status(statusCode);
}

const telegramController: TelegramController = new TelegramControllerImpl()
export {telegramController}