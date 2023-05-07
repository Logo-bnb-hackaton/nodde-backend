import { documentClient } from "@/db/dynamo"
import { GetCommand, GetCommandInput, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb"
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"


export interface ProfileDO {
    id: string,
    description: string,
    instant: string,
    logoId: string,
    socialMediaLinks: string[],
    title: string
}

export interface ProfileRepository {

    getById(id: string): Promise<ProfileDO|undefined>

    put(profile: ProfileDO): Promise<void>

}

export class ProfileRepositoryImpl implements ProfileRepository {

    private table = 'Community-profile';

    async getById(id: string): Promise<ProfileDO|undefined> {

        console.log(`Start get profile ${id}`);

        const input: GetCommandInput = {
            TableName: this.table,
            Key: marshall({
                "id": id
            })
        }

        const command: GetCommand = new GetCommand(input);

        const result = await documentClient.send(command);

        if (!result.Item) {
            console.log(`Profile not found ${id}`);
            return undefined;
        }

        const profile = unmarshall(result.Item) as ProfileDO;

        console.log(`Got frofile ${profile}`);

        return profile;
    }

    async put(profile: ProfileDO): Promise<void> {

        console.log(`Start save profile ${profile}`);
        
        const input: PutCommandInput = {
            TableName: this.table,
            Item: marshall(profile)
        };

        const command: PutCommand = new PutCommand(input);

        await documentClient.send(command);

        console.log(`Profile saved ${profile}`);
    }
}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export { profileRepository }