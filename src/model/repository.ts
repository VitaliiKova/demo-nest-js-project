import { Branch } from './branch';

export interface Repository {
  repository_name: string;
  owner_login: string;
  branches: Branch[];
}
