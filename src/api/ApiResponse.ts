import { Error } from "./ApiErrorResponse"

export class ApiResponse<T> {
    
    public data?: T
    public error?: Error

    static error<T>(code: string, message: string): ApiResponse<T> {
        let apiResponse = new ApiResponse<T>()
        apiResponse.error = new Error(code, message)
        return apiResponse
    }
}