import { dynamo } from "./dynamo";
import { Error, Success } from "../common";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { GetItemCommandInput } from "@aws-sdk/client-dynamodb";
import { PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

export class DbResult<Type> {

    public status: string;
    public item?: Type

    public constructor(status: string, item: Type) {
        this.status = status;
        this.item = item;
    }
}

export const get = async (params: GetItemCommandInput): Promise<DbResult<any>> {
    try {
        const result = await dynamo.send(new GetItemCommand(params))
        return new DbResult(Success, result.Item)
    } catch (error) {
        console.error(`Error when get params: ${params}`, error);
        return new DbResult(Error, undefined)
    }
}

export const put = async (params: PutItemCommandInput): Promise<DbResult<any>> => {
    try {
        await dynamo.send(new PutItemCommand(params))
        return new DbResult(Success, undefined)
    } catch (error) {
        console.error(`Error when save to db with params: ${params}`, error);
        return new DbResult(Error, undefined)
    }
}