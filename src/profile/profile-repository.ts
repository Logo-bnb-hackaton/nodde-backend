import {documentClient} from "@/db/dynamo";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {GetItemCommand, PutItemCommand, PutItemCommandInput} from "@aws-sdk/client-dynamodb";
import {GetItemCommandInput} from "@aws-sdk/client-dynamodb/dist-types/commands/GetItemCommand";

export interface ProfileDO {
    id: string,
    description: string,
    instant: string,
    logoId: string,
    socialMediaLinks: string[],
    title: string
}

export interface ProfileRepository {

    getById(id: string): Promise<ProfileDO | undefined>

    put(profile: ProfileDO): Promise<void>

}

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