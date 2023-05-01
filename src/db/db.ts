import { dynamo } from "./dynamo";
import { Error, Success } from "../common";
import { GetItemCommand, ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
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

export const get = async (params: GetItemCommandInput): Promise<DbResult<any>> => {
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

export const loadBySId = async (tableName: string, id: string): Promise<DbResult<any>> => {
    return await get({
        TableName: tableName,
        Key: {
            "id": {
                "S": id
            }
        }
    })
}

export const loadByNId = async (tableName: string, id: Number): Promise<DbResult<any>> => {
    return await get(
        {
            TableName: tableName,
            Key: {
                "id": {
                    "N": id.toString()
                }
            }
        }
    )
}

export const scanTable = async (tableName: string): Promise<any[]> => {

    let input: any = {
        TableName: tableName
    }

    const scanResults: any[] = []
    let items: ScanCommandOutput

    do {
        items = await dynamo.send(new ScanCommand(input))
        items.Items?.forEach((item) => scanResults.push(item))
        input = {
            TableName: tableName,
            ExclusiveStartKey: items.LastEvaluatedKey
        }
    } while (typeof items.LastEvaluatedKey !== "undefined")

    return scanResults
}