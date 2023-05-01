import { Success } from "@/common"
import { DbResult, put, query } from "../db/db"

export class AuthNonce {
    constructor(
        readonly address: string,
        readonly nonce: string,
        readonly createdAt: number,
        readonly expiredIn: number,
    ) {}
}

export interface AuthRepository {
    saveAuthNonce(authNonde: AuthNonce): Promise<DbResult<AuthNonce>>
    getAuthNonceByAddress(address: string): Promise<DbResult<AuthNonce | undefined>>
}

export class AuthRepositoryImpl implements AuthRepository {

    private tableName: string = "auth-nonce"

    async saveAuthNonce(authNonde: AuthNonce): Promise<DbResult<AuthNonce>> {
        return put({
            TableName: this.tableName,
            Item: {
                address: {
                    S: authNonde.address
                },
                nonce: {
                    S: authNonde.nonce
                },
                createdAt: {
                    N: authNonde.createdAt.toString()
                },
                expiredIn: {
                    N: authNonde.expiredIn.toString()
                }
            }
        })
    }
    async getAuthNonceByAddress(address: string): Promise<DbResult<AuthNonce | undefined>> {
        const result = await query({
            TableName: this.tableName,
            KeyConditionExpression: "address = :address",
            ExpressionAttributeValues: {
                ":address": { S: address },
            },
            ScanIndexForward: false,
            Limit: 1,
        })

        if (result.status === Success && (result.item as Array<any>).length == 1) {
            return new DbResult(Success, result.item[0])
        }

        return result
    }

}

const authRepository: AuthRepository = new AuthRepositoryImpl()
export { authRepository }