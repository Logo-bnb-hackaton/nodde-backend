import { Success } from "@/common"
import { DbResult, put, query } from "../db/db"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

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
            Item: marshall(authNonde, {
                convertClassInstanceToMap: true
            })
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
            const items = (result.item as Array<any>).map((i) => unmarshall(i))
            return new DbResult(Success, new AuthNonce(
                items[0]!["address"],
                items[0]!["nonce"],
                items[0]!["createdAt"],
                items[0]!["expiredIn"]
            ))
        }

        return result
    }

}

const authRepository: AuthRepository = new AuthRepositoryImpl()
export { authRepository }