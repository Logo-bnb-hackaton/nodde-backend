import { DbResult, get, put } from "../db/db"

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
                    "S": authNonde.address
                },
                nonce: {
                    "S": authNonde.nonce
                },
                createdAt: {
                    "N": authNonde.createdAt.toString()
                },
                expiredIn: {
                    "N": authNonde.expiredIn.toString()
                }
            }
        })
    }
    async getAuthNonceByAddress(address: string): Promise<DbResult<AuthNonce | undefined>> {
        return get({
            TableName: this.tableName,
            Key: {
                address: {
                    "S": address
                }
            }
        })
    }

}

const authRepository: AuthRepository = new AuthRepositoryImpl()
export { authRepository }