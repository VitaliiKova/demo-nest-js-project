import { GitBranch } from './git-branch';

export interface GitRepository {
  repository_name: string;
  owner_login: string;
  branches: GitBranch[];
}
