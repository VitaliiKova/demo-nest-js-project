export class User {
  public constructor(private login: string, private isOrg: boolean) {}

  public getLogin(): string {
    return this.login;
  }

  public getIsOrg(): boolean {
    return this.isOrg;
  }
}
