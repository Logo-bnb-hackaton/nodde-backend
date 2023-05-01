
export class ApiErrorResponse {
    readonly error!: Error
    constructor(code: string, message: string) {
        this.error = new Error(code, message)
    }
}

export class Error {
    constructor(readonly code: string, readonly message: string) {}
}