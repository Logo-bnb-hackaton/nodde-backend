import { ProfileDO } from "./ProfileDO"

export interface ProfileRepository {

    getById(id: string): Promise<ProfileDO | undefined>

    put(profile: ProfileDO): Promise<void>

}
