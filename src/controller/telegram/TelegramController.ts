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
            this.handleInvokeCommandOutput(res, serviceResponse);

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
            this.handleInvokeCommandOutput(res, invocationResult);

        } catch (error) {
            console.error(error);
            res.json(unknownApiError).status(500);
        }
    }


    async bindChat(req: Request, res: Response): Promise<void> {

        try {

            const { code, subscriptionId } = req.body as BindChatRequest;
            const address = req.session.siwe.address;
            const serviceResponse = await telegramService.bindChat(code, address, subscriptionId);
            this.handleInvokeCommandOutput(res, serviceResponse);

        } catch (error) {
            console.error(error)
            res.json(unknownApiError).status(500);

        }
    }

    async getChatBindingStatus(req: Request, res: Response): Promise<void> {

        try {

            const {subscriptionId} = req.body as GetChatBindingStatusRequest;
            const address = req.session.siwe.address;
            const invocationResult = await telegramService.getChatBindingStatus(address, subscriptionId);
            this.handleInvokeCommandOutput(res, invocationResult);

        } catch (error) {
            console.error(error)
            res.json(unknownApiError).status(500);
        }
    }

    handleInvokeCommandOutput(res: Response, output: InvokeCommandOutput): void {
        let response: any;
        let statusCode = output.StatusCode;

        if (200 === output.StatusCode || output.StatusCode?.toString().startsWith("4")) {
            response = getJsonFromLambdaResponse(output);
        } else {
            response = unknownApiError;
            statusCode = 500;
        }

        res.json(response).status(statusCode);
    }
}

const telegramController: TelegramController = new TelegramControllerImpl()
export {telegramController}