import { Error } from "./ApiErrorResponse"

export class ApiResponse<T> {
    
    public data?: T
    public error?: Error

    static data<T>(data: T): ApiResponse<T> {
        let apiResponse = new ApiResponse<T>()
        apiResponse.data = data
        return apiResponse
    }

    static error<T>(code: string, message: string): ApiResponse<T> {
        let apiResponse = new ApiResponse<T>()
        apiResponse.error = new Error(code, message)
        return apiResponse
    }
}