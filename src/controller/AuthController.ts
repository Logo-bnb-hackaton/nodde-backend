
export class AuthenticationRequest {
    constructor(readonly address: string) {}
}

export class AuthenticationResponse {
    constructor(readonly nonce: string) {}
}

export interface AuthController {
    authenticate(authReq: AuthenticationRequest): Promise<AuthenticationResponse> 
}

export class AuthControllerImpl implements AuthController {

    

    async authenticate(authReq: AuthenticationRequest): Promise<AuthenticationResponse> {

    }
}