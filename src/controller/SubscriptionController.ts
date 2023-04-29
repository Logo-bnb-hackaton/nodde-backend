
class SubscriptionDescriptionRequest {
    constructor(readonly address: string, contentId: string) {}
}

class SubscriptionDescriptionResponse {

}

class SubscriptionUpdateRequest {

}

class SubscriptionUpdateResponse {

}

export interface SubscriptionController {

    getSubscriptionDescription(request: SubscriptionDescriptionRequest): Promise<SubscriptionDescriptionResponse>

    update(request: SubscriptionUpdateRequest): Promise<SubscriptionUpdateResponse>

}

export class SubscriptionControllerImpl implements SubscriptionController {

    getSubscriptionDescription(request: SubscriptionDescriptionRequest): Promise<SubscriptionDescriptionResponse> {
        throw new Error("Method not implemented.")
    }

    update(request: SubscriptionUpdateRequest): Promise<SubscriptionUpdateResponse> {
        throw new Error("Method not implemented.")
    }
    
}

const subscriptionController: SubscriptionController = new SubscriptionControllerImpl()
export { subscriptionController }