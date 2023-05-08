import {TelegramService} from "@/telegram/TelegramService";
import {invokeLambda} from "@/lambda/wrap";
import {InvokeCommandOutput} from "@aws-sdk/client-lambda";

class TelegramServiceImpl implements TelegramService {

    async bindChat(code: string, address: string, subscriptionId: string): Promise<InvokeCommandOutput> {
        return invokeLambda("bindChat", {
            code: code,
            address: address,
            subscription_id: subscriptionId
        });
    }

    async getInviteLinkStatus(address: string, subscriptionId: string): Promise<InvokeCommandOutput> {
        return invokeLambda("getInviteLinkStatus", {
            address: address,
            subscription_id: subscriptionId
        });
    }

    async generateInviteCode(address: string, subscriptionId: string): Promise<InvokeCommandOutput> {
        return invokeLambda("generateInviteCode", {
                address: address,
                subscription_id: subscriptionId
        })
    }

    async getChatBindingStatus(address: string, subscriptionId: string): Promise<InvokeCommandOutput> {
        return invokeLambda("getChatBindingStatus", {
            address: address,
            subscription_id: subscriptionId
        })
    }
}

const telegramService: TelegramService = new TelegramServiceImpl();
export {telegramService};