import { AuthService, authService } from "../auth/auth-servce";

export class AuthenticationRequest {
    constructor(readonly address: string) {}
}

export class AuthenticationResponse {
    constructor(readonly nonce: string, readonly expiredIn: number) {}
}

export interface AuthController {
    authenticate(authReq: AuthenticationRequest): Promise<AuthenticationResponse> 
}

export class AuthControllerImpl implements AuthController {

    constructor(readonly authService: AuthService) {}

    async authenticate(authReq: AuthenticationRequest): Promise<AuthenticationResponse> {
        let { address } = authReq
        let authNonce = await this.authService.createNewNonce(address)
        return new AuthenticationResponse(authNonce.nonce, authNonce.expiredIn)
    }
}

const authController: AuthController = new AuthControllerImpl(authService)
export { authController }