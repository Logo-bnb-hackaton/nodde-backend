
export const Success = "Success"
export const Error = "Error"
export const CommonErrorMessage = "Something went wrong"
export const AWS_REGION = "us-east-1"

export function timestampSeconds(): number {
    return Date.now() / 1000
}