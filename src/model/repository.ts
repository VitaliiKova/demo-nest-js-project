import { Branch } from './branch';

export class Repository {
  public constructor(
    private repository_name: string,
    private owner_login: string,
    private branches: Branch[] = [],
  ) {}

  public getName(): string {
    return this.repository_name;
  }

  public setBranches(branches: Branch[]) {
    this.branches = branches;
  }
}
