import { DbResult } from "../db/wrappers"

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
        throw new Error("Method not implemented.")
    }
    async getAuthNonceByAddress(address: string): Promise<DbResult<AuthNonce | undefined>> {
        throw new Error("Method not implemented.")
    }

}

