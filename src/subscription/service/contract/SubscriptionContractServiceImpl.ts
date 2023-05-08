import {EventFilter, ethers, providers} from "ethers";
import {NewSubscriptionEvent} from "./NewSubscriptionEvent";
import {SubscriptionContractService} from "./SubscriptionContractService";
import {Result} from "ethers/lib/utils";

const networkRpc = "https://data-seed-prebsc-2-s3.binance.org:8545";
const subscriptionContractAddress = "0xe56e5FD2D7aeAde39B04EFb41992a233948D304e";

const eventConfigs = {
    NewSubscription: {
        abi: ['event NewSubscription(bytes32 indexed hexId, address indexed participant, uint256 indexed author, uint256 subscriptionIndex, uint256 subscriptionEndTime, address tokenAddress, uint256 amount)'],
        topic: '0x5f87b5d2232f36bc519cffbc5e9db4bd8743fc011e34a935ba43dc9f575f90b6'
    }
};

export class SubscriptionContractServiceImpl implements SubscriptionContractService {

    networkRpcProvider: ethers.providers.JsonRpcProvider = new providers.JsonRpcProvider({
        url: networkRpc
    })

    async findValidSubscription(ownerId: string, subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>> {

        console.log('Query for logs ' + subscriptionHexId);

        const transformedAddress = this.transformAddress(address);

        const filter = {
            address: subscriptionContractAddress,
            fromBlock: 29187338,
            toBlock: 'latest',
            topics: [eventConfigs.NewSubscription.topic, transformedAddress]
        }

        const logs = await this.getLogs(eventConfigs.NewSubscription.abi, filter);
        const subscriptionIdAsNumber = ethers.BigNumber.from(subscriptionHexId).toNumber();

        return logs
            .map((log) => {

                const {hexId, participant, author, subscriptionIndex, subscriptionEndTime, tokenAddress, amount} = log;

                return {
                    hexId: hexId,
                    participant: participant,
                    author: author.toString(),
                    subscriptionId: subscriptionIndex.toNumber(),
                    subscriptionEndTime: subscriptionEndTime.toString(),
                    tokenAddress: tokenAddress,
                    amount: amount.toNumber(),
                }
            })
            .filter(log => log.author === ownerId && log.subscriptionId === subscriptionIdAsNumber);
    }

    private async getLogs(abi: string[], filter: EventFilter): Promise<Array<Result>> {
        const iface = new ethers.utils.Interface(abi);
        return await this.networkRpcProvider
            .getLogs(filter)
            .then(logs => logs.map(log => iface.parseLog(log).args));
    }


    private transformAddress(address: string): string {
        address = address.slice(2);
        const zerosToAdd = 64 - address.length;
        const paddedString = '0'.repeat(zerosToAdd) + address;
        return '0x' + paddedString;
    }
}

const subscriptionContractService: SubscriptionContractService = new SubscriptionContractServiceImpl();
export {subscriptionContractService}