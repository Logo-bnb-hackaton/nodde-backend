import { dynamo } from "./dynamo";
import { Error, Success } from "../common";
import { GetItemCommand, QueryCommand, QueryCommandInput, ScanCommand, ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { GetItemCommandInput } from "@aws-sdk/client-dynamodb";
import { PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class DbResult<Type> {

    public status: string;
    public item?: Type;

    constructor(
        status: string,
        item?: Type
    ) {
        this.status = status
        this.item = item
    }

}

export const get = async (params: GetItemCommandInput): Promise<DbResult<any>> => {
    try {
        const result = await dynamo.send(new GetItemCommand(params))
        return {
            status: Success,
            item: result.Item
        }
    } catch (error) {
        console.error(`Error when get params: ${params}`, error);
        return {
            status: Error
        }
    }
}

export const query = async (params: QueryCommandInput): Promise<DbResult<any>> => {
    try {
        const result = await dynamo.send(new QueryCommand(params))
        return {
            status: Success,
            item: result.Items
        }
    } catch (error) {
        console.error(`Error when get params: ${params}`, error);
        return {
            status: Error
        }
    }
}

export const put = async (params: PutItemCommandInput): Promise<DbResult<any>> => {
    try {
        await dynamo.send(new PutItemCommand(params))
        return {
            status: Success
        }
    } catch (error) {
        console.error(`Error when save to db with params: ${params}`, error);
        return {
            status: Error
        }
    }
}

export enum OperationStatus {
    SUCCESS,
    ERROR
}

export const getItem = async (params: {TableName: string, Key: any}): Promise<Record<string, any>> => {
    
    const input: GetItemCommandInput = {
        TableName: params.TableName,
        Key: marshall(params.Key, {
            convertClassInstanceToMap: true
        })
    }

    return dynamo.send(new GetItemCommand(input))
        .then(i => unmarshall(i.Item!))
}

export const putItem = async (params: {TableName: string, Item: any}): Promise<OperationStatus> => {
    try {
        const input: PutItemCommandInput = {
            TableName: params.TableName,
            Item: marshall(params.Item, {
                convertClassInstanceToMap: true,
                convertEmptyValues: true
            })
        }
        await dynamo.send(new PutItemCommand(input))
        return OperationStatus.SUCCESS
    } catch (error) {
        console.error(error)
        return OperationStatus.ERROR
    }
}

export const loadBySId = async (tableName: string, id: string): Promise<DbResult<any>> => {
    return await get({
        TableName: tableName,
        Key: {
            id: {
                S: id
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