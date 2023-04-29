import { NextFunction, Request, Response } from "express"


export interface SubscriptionController {

    getSubscriptionDescription(req: Request, res: Response, next: NextFunction): void

    update(req: Request, res: Response, next: NextFunction): void

}

export class SubscriptionControllerImpl implements SubscriptionController {

    getSubscriptionDescription(req: Request, res: Response, next: NextFunction): void {
        throw new Error("Method not implemented.")
    }

    update(req: Request, res: Response, next: NextFunction): void {
        throw new Error("Method not implemented.")
    }
    
}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export { subscriptionController }