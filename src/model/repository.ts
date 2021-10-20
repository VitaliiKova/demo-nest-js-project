import { Branch } from './branch';

export class Repository {
  public constructor(
    readonly repository_name: string,
    readonly owner_login: string,
    private branches: Branch[] = [],
  ) {}

  public setBranches(branches: Branch[]) {
    this.branches = branches;
  }
}
