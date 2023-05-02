import { X_API_WALLET_ADDRESS_HEADER } from "@/auth/auth-servce";
import { toErrorResponse, toSuccessResponse } from "@/common";
import { getJsonFromLambdaResponse, invokeLambda } from "@/lambda/wrap";
import { NextFunction, Request, Response } from "express";

export interface TelegramController {
    getInviteLink(req: Request, res: Response, next: NextFunction): Promise<void>
    generateInviteLink(req: Request, res: Response, next: NextFunction): Promise<void>
    bindChat(req: Request, res: Response, next: NextFunction): Promise<void>
    getChatBindingStatus(req: Request, res: Response, next: NextFunction): Promise<void>
}

export class TelegramControllerImpl implements TelegramController {

    async getInviteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const { content_id } = body
            const invocationResult = await invokeLambda("getInviteCode", {
                address: address,
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
            next()
        } catch (error) {
            console.error(error)
        }
    }

    async generateInviteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = JSON.parse(Buffer.from(req.body).toString())
            const address = req.headers[X_API_WALLET_ADDRESS_HEADER]
            const { content_id, author } = body
            const invocationResult = await invokeLambda("prepareInvite", {
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
                res
                    .send(toErrorResponse("Something went wrong"))
                    .status(500)
            }
            next()
        } catch (error) {
            console.error(error)
        }
    }


    async bindChat(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            next()
        } catch (error) {
            console.error(error)
            res
                .send(toErrorResponse("Bad request"))
                .status(400) 
        }
    }

    async getChatBindingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
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
            next()
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