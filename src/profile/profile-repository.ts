import { ProfileTableName } from "@/common"
import { OperationStatus, putItem } from "@/db/db"

// TODO define profile model and refactor
export class Profile {
    constructor(
        readonly id: string
    ) {}
}

export interface ProfileRepository {
    save(profile: Profile): Promise<OperationStatus>
}

export class ProfileRepositoryImpl implements ProfileRepository {
    async save(profile: Profile): Promise<OperationStatus> {
        return putItem({
            TableName: ProfileTableName,
            Item: profile
        })
    }
}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export { profileRepository }