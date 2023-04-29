import { Request } from "express"
import { AuthNonce, AuthRepository, authRepository } from "./auth-repository"
import { Success, timestampSeconds } from "../common"
import { ethers } from "ethers"

export interface AuthService {
    // Defines does a request authenticated
    isAuthorized(req: Request): Promise<boolean>

    createNewNonce(address: string): Promise<AuthNonce>
}

const X_API_WALLET_ADDRESS_HEADER = "x-api-wallet-address"
const X_API_SIGNATURE_HEADER = "x-api-signature"

export class AuthServiceImpl implements AuthService {

    constructor(readonly authRepo: AuthRepository) { }

    async isAuthorized(req: Request): Promise<boolean> {
        let headers = req.headers
        let address = headers[X_API_WALLET_ADDRESS_HEADER] as string
        let signature = headers[X_API_SIGNATURE_HEADER] as string

        return await this.verifySignature(address, signature)
    }

    async createNewNonce(address: string): Promise<AuthNonce> {
        
        let nonce = await this.generateNewNonce(10)
        let newAuthNonce = new AuthNonce(
            address,
            nonce,
            timestampSeconds(),
            3600
        )

        let { status, item } = await this.authRepo.saveAuthNonce(newAuthNonce)

        if (status !== Success) {
            throw new Error(`Error when create new auth nonce for address ${address}`)
        }

        return item!
    }

    private async generateNewNonce(length: number): Promise<string> {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }


    private async verifySignature(address: string, signature: string): Promise<boolean> {

        if (address == undefined || signature == undefined) {
            console.error(`Can't verify signature ${signature} with address ${address}`)
            return false
        }
        
        let { status, item } = await this.authRepo.getAuthNonceByAddress(address)
        
        if (status !== Success) {
            console.error(`Not success response from database when verify signature for address ${address}`)
            return false
        }

        if (!item) {
            console.error(`Not found auth nonce for address ${address}`)
            return false
        }

        try {
            let signedAddress = ethers.verifyMessage(item.nonce, signature)
            if (signedAddress === address) {
                return true;
            } else {
                console.error(`Signed address ${signedAddress} does not equal to ${address}`)
            }
        } catch (err) {
            console.error(`Error occurred when verify a signature for address ${address}`, err)
        }

        return false
    }
}


const authService: AuthService = new AuthServiceImpl(authRepository)
export { authService }