import { UserTypeEnum } from './user-types.enum';

export interface GithubUser {
  login: string;
  type: UserTypeEnum;
}
