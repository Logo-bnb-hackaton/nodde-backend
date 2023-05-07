export const base64StringToBuffer = async (base64String: string): Promise<Buffer> => {
    return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64")
}

export function s3DataToBase64String(s3Data: any): string {
    return `data:${s3Data.ContentType};base64,${s3Data.Body.toString('base64')}`;
}
