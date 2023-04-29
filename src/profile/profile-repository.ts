

export interface ProfileRepository {

}

const ProfileTableName = "Community-profile";

export class ProfileRepositoryImpl implements ProfileRepository {

}

const profileRepository: ProfileRepository = new ProfileRepositoryImpl()
export { profileRepository }