
export const Success = "Success"
export const Error = "Error"
export const CommonErrorMessage = "Something went wrong"
export const AWS_REGION = "us-east-1"

export const ProfileImageBucket = "community-profile-images-1r34goy";
export const ProfileTableName = "Community-profile";

export function timestampSeconds(): number {
    return Date.now() / 1000
}



export const toSuccessResponse = (data: any) => {
    return {
        status: 'success',
        data: data
    }
}

export const toErrorResponse = (errorMessage: string): {
    status: string,
    data?: any,
    errorMessage: string
} => {
    return {
        status: 'error',
        data: null,
        errorMessage: errorMessage
    }
}