import {EventFilter, ethers, providers} from "ethers";
import {NewSubscriptionEvent} from "./NewSubscriptionEvent";
import {SubscriptionContractService} from "./SubscriptionContractService";
import {Result} from "ethers/lib/utils";
import * as console from "console";
import {SubscriptionCreationEvent} from "@/subscription/service/contract/SubscriptionCreationEvent";

const initialContractBlock = 29651840;
const networkRpc = "https://data-seed-prebsc-2-s3.binance.org:8545";
const subscriptionContractAddress = "0xc65136CA205FbefBcB30466dD62A742a1B372327";
const abi = '[{"inputs":[{"internalType":"address","name":"_mainNFTAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"author","type":"uint256"},{"indexed":true,"internalType":"bytes32","name":"hexId","type":"bytes32"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"indexed":false,"internalType":"struct Subscriptions.Discount[]","name":"discounts","type":"tuple[]"}],"name":"NewOneTimeSubscriptionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"author","type":"uint256"},{"indexed":true,"internalType":"bytes32","name":"hexId","type":"bytes32"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paymetnPeriod","type":"uint256"},{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"indexed":false,"internalType":"struct Subscriptions.Discount[]","name":"discounts","type":"tuple[]"}],"name":"NewRegularSubscriptionCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"hexId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"participant","type":"address"},{"indexed":true,"internalType":"uint256","name":"author","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"subscriptionEndTime","type":"uint256"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"NewSubscription","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Received","type":"event"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"author","type":"uint256"}],"name":"addToBlackList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"blackListByAuthor","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"}],"name":"changeActivityState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"commissionCollector","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"hexId","type":"bytes32"},{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"bool","name":"isRegularSubscription","type":"bool"},{"internalType":"uint256","name":"paymetnPeriod","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"internalType":"struct Subscriptions.Discount[]","name":"discountProgramm","type":"tuple[]"}],"name":"createNewSubscriptionByEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"hexId","type":"bytes32"},{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"bool","name":"isRegularSubscription","type":"bool"},{"internalType":"uint256","name":"paymetnPeriod","type":"uint256"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"internalType":"struct Subscriptions.Discount[]","name":"discountProgramm","type":"tuple[]"}],"name":"createNewSubscriptionByToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"discountSubscriptionsByAuthor","outputs":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"}],"name":"getDiscountSubscriptionsByAuthor","outputs":[{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"internalType":"struct Subscriptions.Discount[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"}],"name":"getParticipantsSubscriptionsByAuthor","outputs":[{"components":[{"internalType":"address","name":"participantAddress","type":"address"},{"internalType":"uint256","name":"subscriptionEndTime","type":"uint256"}],"internalType":"struct Subscriptions.Participant[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"}],"name":"getPaymentSubscriptionsByAuthor","outputs":[{"components":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"amountInEth","type":"uint256"},{"internalType":"uint256","name":"paymentTime","type":"uint256"}],"internalType":"struct Subscriptions.Payment[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"}],"name":"getRatingSubscriptionsByAuthor","outputs":[{"internalType":"uint256","name":"active","type":"uint256"},{"internalType":"uint256","name":"cancelled","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"hexId","type":"bytes32"}],"name":"getSubscriptionIndexByHexId","outputs":[{"internalType":"uint256[2]","name":"","type":"uint256[2]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"internalType":"uint256","name":"periods","type":"uint256"},{"internalType":"address","name":"customTokenAddress","type":"address"}],"name":"getSubscriptionPriceFromCustomToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"}],"name":"getSubscriptionsByAuthor","outputs":[{"components":[{"internalType":"bytes32","name":"hexId","type":"bytes32"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isRegularSubscription","type":"bool"},{"internalType":"uint256","name":"paymetnPeriod","type":"uint256"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"internalType":"struct Subscriptions.Subscription[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"internalType":"uint256","name":"periods","type":"uint256"}],"name":"getTotalPaymentAmountForPeriod","outputs":[{"internalType":"uint256","name":"amountInToken","type":"uint256"},{"internalType":"uint256","name":"amountInEth","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"participantIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"participantsSubscriptionsByAuthor","outputs":[{"internalType":"address","name":"participantAddress","type":"address"},{"internalType":"uint256","name":"subscriptionEndTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"paymentSubscriptionsByAuthor","outputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"amountInEth","type":"uint256"},{"internalType":"uint256","name":"paymentTime","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"author","type":"uint256"}],"name":"removeBlackList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"mainNFTAddress","type":"address"}],"name":"setIMainNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"components":[{"internalType":"uint256","name":"period","type":"uint256"},{"internalType":"uint16","name":"amountAsPPM","type":"uint16"}],"internalType":"struct Subscriptions.Discount[]","name":"discountProgramm","type":"tuple[]"}],"name":"setNewDiscountProgramm","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"internalType":"uint256","name":"paymetnPeriod","type":"uint256"}],"name":"setNewPaymetnPeriod","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"name":"setNewTokensAndPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"subscriptionIndexByHexId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"author","type":"uint256"},{"internalType":"uint256","name":"subscriptionIndex","type":"uint256"},{"internalType":"address","name":"participantSelectedTokenAddress","type":"address"},{"internalType":"uint256","name":"periods","type":"uint256"}],"name":"subscriptionPayment","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"subscriptionsByAuthor","outputs":[{"internalType":"bytes32","name":"hexId","type":"bytes32"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isRegularSubscription","type":"bool"},{"internalType":"uint256","name":"paymetnPeriod","type":"uint256"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalPaymentSubscriptionsByAuthoInEth","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]';

const signatureNewSubscription = 'NewSubscription(bytes32,address,uint256,uint256,uint256,address,uint256)';
const abiNewSubscription = ['event NewSubscription(bytes32 indexed hexId, address indexed participant, uint256 indexed author, uint256 subscriptionIndex, uint256 subscriptionEndTime, address tokenAddress, uint256 amount)'];

// TODO add this fields
const signatureSubcriptionCreation = 'NewOneTimeSubscriptionCreated(uint256,bytes32,address,uint256,(uint256,uint16)[])';
const abiSubcriptionCreation = ['event NewOneTimeSubscriptionCreated(uint256 indexed author, bytes32 indexed hexId, address tokenAddress, uint256 price, (uint256,uint16)[] discounts)'];

const provider = new providers.JsonRpcProvider({url: networkRpc});

export class SubscriptionContractServiceImpl implements SubscriptionContractService {

    async findPayedSubscriptions(subscriptionHexId: string, address: string): Promise<Array<NewSubscriptionEvent>> {

        console.log('Query for logs ' + subscriptionHexId);

        const filter = {
            address: subscriptionContractAddress,
            fromBlock: initialContractBlock,
            toBlock: 'latest',
            topics: [ethers.utils.id(signatureNewSubscription)]
        }

        const logs = await this.getLogs(abiNewSubscription, filter);

        return logs.map((log) => {

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
            .filter(log => log.hexId === subscriptionHexId)
            .filter(log => log.participant === address);
    }

    async findSubscriptionCreations(subscriptionHexId: string): Promise<Array<SubscriptionCreationEvent>> {
        console.log('Query for logs ' + subscriptionHexId);

        const filter = {
            address: subscriptionContractAddress,
            fromBlock: initialContractBlock,
            toBlock: 'latest',
            topics: [ethers.utils.id(signatureSubcriptionCreation)]
        }

        const logs = await this.getLogs(abiSubcriptionCreation, filter);

        return logs.map((log) => {

            const {author, hexId, tokenAddress, price, discounts} = log;

            return {
                author: author.toString(),
                hexId: hexId.toString(),
                tokenAddress: tokenAddress.toString(),
                price: price.toString(),
                discounts: discounts
            }
        })
            .filter(log => log.hexId === subscriptionHexId);
    }

    private async getLogs(abi: string[], filter: EventFilter): Promise<Array<Result>> {
        const iface = new ethers.utils.Interface(abi);
        return await provider
            .getLogs(filter)
            .then(logs => logs.map(log => iface.parseLog(log).args));
    }
}

const subscriptionContractService: SubscriptionContractService = new SubscriptionContractServiceImpl();
export {subscriptionContractService}