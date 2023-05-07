
export interface NewSubscriptionEvent {
    participant: string,
    author: number,
    subscriptionId: number,
    subscriptionEndTime: number,
    tokenAddress: string,
    amount: number,
}