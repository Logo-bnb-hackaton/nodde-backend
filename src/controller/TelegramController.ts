import { NextFunction, Request, Response } from "express";

export interface TelegramController {
    getInviteLink(req: Request, res: Response, next: NextFunction): void
    generateInviteLink(req: Request, res: Response, next: NextFunction): void
    bindChat(req: Request, res: Response, next: NextFunction): void
}

export class TelegramControllerImpl implements TelegramController {
    
    getInviteLink(req: Request, res: Response, next: NextFunction): void {
        
        next()
    }

    generateInviteLink(req: Request, res: Response, next: NextFunction): void {
        
        next()
    }


    bindChat(req: Request, res: Response, next: NextFunction): void {
        
        next()
    }
    
}

const telegramController: TelegramController = new TelegramControllerImpl()
export { telegramController }