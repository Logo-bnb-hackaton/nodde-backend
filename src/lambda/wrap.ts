import { InvokeCommand, InvokeCommandInput, InvokeCommandOutput, LogType } from "@aws-sdk/client-lambda"
import { lambda } from "./lambda"

export const invokeLambda = async (name: string, body: any): Promise<InvokeCommandOutput> => {

    const input: InvokeCommandInput = {
        FunctionName: name,
        InvocationType: "RequestResponse",
        Payload: Buffer.from(JSON.stringify(body)),
        LogType: LogType.Tail
    }

    const command = new InvokeCommand(input)

    return lambda.send(command)
}