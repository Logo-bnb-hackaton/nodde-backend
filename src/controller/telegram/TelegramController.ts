import { unknownApiError } from "@/api/ApiResponse";
import { toErrorResponse, toSuccessResponse } from "@/common";
import { getJsonFromLambdaResponse, invokeLambda } from "@/lambda/wrap";
import { Request, Response } from "express";

export interface TelegramController {

    getInviteLinkStatus(req: Request, res: Response): Promise<void>

    generateInviteCode(req: Request, res: Response): Promise<void>

    bindChat(req: Request, res: Response): Promise<void>

    getChatBindingStatus(req: Request, res: Response): Promise<void>

}

export const X_API_WALLET_ADDRESS_HEADER = "x-api-wallet-address"

export class TelegramControllerImpl implements TelegramController {

    async getInviteLinkStatus(req: Request, res: Response): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const { content_id } = body
            const invocationResult = await invokeLambda("getInviteLinkStatus", {
                address: address,
                subscription_id: content_id
            })
            if (200 === invocationResult.StatusCode) {
                res
                    .send(toSuccessResponse(getJsonFromLambdaResponse(invocationResult)))
                    .status(200)
            } else if (invocationResult.StatusCode?.toString().startsWith("4")) {
                console.log(`Payload ${getJsonFromLambdaResponse(invocationResult)}`)
                res
                    .send(toErrorResponse("Bad request"))
                    .status(invocationResult.StatusCode!)
            } else {
                res.json(unknownApiError).status(500)
            }
        } catch (error) {
            console.error(error)
        }
    }

    async generateInviteCode(req: Request, res: Response): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const { content_id, author } = body
            const invocationResult = await invokeLambda("generateInviteCode", {
                address: address,
                content_id: content_id,
                author: author
            })
            if (200 === invocationResult.StatusCode) {
                res
                    .send(toSuccessResponse(getJsonFromLambdaResponse(invocationResult)))
                    .status(200)
            } else if (invocationResult.StatusCode?.toString().startsWith("4")) {
                console.log(`Payload ${invocationResult.Payload}`)
                res
                    .send(toErrorResponse("Bad request"))
                    .status(invocationResult.StatusCode!)
            } else {
                res.json(unknownApiError).status(500)
            }
        } catch (error) {
            console.error(error)
        }
    }


    async bindChat(req: Request, res: Response): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const { code, content_id } = body
            const invocationResult = await invokeLambda("bindChat", {
                address: address,
                code: code,
                content_id: content_id
            })
            if (200 === invocationResult.StatusCode) {
                res
                    .send(toSuccessResponse(getJsonFromLambdaResponse(invocationResult)))
                    .status(200)
            } else if (invocationResult.StatusCode?.toString().startsWith("4")) {
                console.log(`Payload ${getJsonFromLambdaResponse(invocationResult)}`)
                res
                    .send(toErrorResponse("Bad request"))
                    .status(invocationResult.StatusCode!)
            } else {
                res
                    .send(toErrorResponse("Something went wrong"))
                    .status(500)
            }
        } catch (error) {
            console.error(error)
            res
                .send(toErrorResponse("Bad request"))
                .status(400) 
        }
    }

    async getChatBindingStatus(req: Request, res: Response): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const { content_id, author_id } = body;
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const invocationResult = await invokeLambda("getChatBindingStatus", {
                address: address,
                author_id: author_id,
                content_id: content_id
            })
            if (200 === invocationResult.StatusCode) {
                res
                    .send(toSuccessResponse(getJsonFromLambdaResponse(invocationResult)))
                    .status(200)
            } else if (invocationResult.StatusCode?.toString().startsWith("4")) {
                console.log(`Payload ${getJsonFromLambdaResponse(invocationResult)}`)
                res
                    .send(toErrorResponse("Bad request"))
                    .status(invocationResult.StatusCode!)
            } else {
                res
                    .send(toErrorResponse("Something went wrong"))
            }     

        } catch (error) {
            console.error(error)
            res
                .send(toErrorResponse("Bad request"))
                .status(400) 
        }
    }
}

const telegramController: TelegramController = new TelegramControllerImpl()
export { telegramController }