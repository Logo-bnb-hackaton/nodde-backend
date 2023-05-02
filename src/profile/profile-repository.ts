import { ProfileTableName } from "@/common"
import { OperationStatus, putItem } from "@/db/db"

// TODO define profile model and refactor
export class ProfileDO {
    constructor(
        readonly id: string
    ) {}
}

export interface ProfileRepository {

    putProfile(profile: any): Promise<OperationStatus>

    save(profile: ProfileDO): Promise<OperationStatus>
}

export class ProfileRepositoryImpl implements ProfileRepository {

    async putProfile(profile: any): Promise<OperationStatus> {
        return putItem({
            TableName: ProfileTableName,
            Item: profile
        })
    }

    async save(profile: ProfileDO): Promise<OperationStatus> {
        return putItem({
            TableName: ProfileTableName,
            Item: profile
        })
    }
}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export { profileRepository }