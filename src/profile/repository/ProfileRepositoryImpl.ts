import { GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { ProfileDO } from "./ProfileDO";
import { ProfileRepository } from "./ProfileRepository";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { documentClient } from "@/db/dynamo";

export class ProfileRepositoryImpl implements ProfileRepository {

    private table = 'Community-profile';

    async getById(id: string): Promise<ProfileDO | undefined> {
        console.log(`Start get profile ${id}`);

        const input: GetItemCommandInput = {
            TableName: this.table,
            Key: marshall({id: id})
        }
        const result = await documentClient.send(new GetItemCommand(input));

        if (!result.Item) {
            console.log(`Profile not found ${id}`);
            return undefined;
        }

        const profile = unmarshall(result.Item) as ProfileDO;
        console.log(`Got profile ${profile}`);
        return profile;
    }

    async put(profile: ProfileDO): Promise<void> {

        console.log(`Start save profile ${profile}`);

        const input: PutItemCommandInput = {
            TableName: this.table,
            Item: marshall(profile)
        };

        await documentClient.send(new PutItemCommand(input));

        console.log(`Profile saved ${profile}`);
    }
}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export {profileRepository}