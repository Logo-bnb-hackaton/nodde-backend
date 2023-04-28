
export class ApiErrorResponse {
    readonly error!: Error
    constructor(readonly code: string, readonly message: string) {
        this.error = new Error(code, message)
    }
}

class Error {
    constructor(readonly code: string, readonly message: string) {}
}