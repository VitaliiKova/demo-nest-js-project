import { HttpStatus, Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { Branch } from '../model/branch';

@Injectable()
export class GithubApiService {
  private readonly gitHubUrl = process.env.GITHUB_URL;
  private readonly headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  private readonly gitHubEndpoints = {
    getUser: (username: string) => `${this.gitHubUrl}/users/${username}`,
    getUserReposList: (username: string) =>
      `${this.gitHubUrl}/users/${username}/repos`,
    getOrgReposList: (org: string) =>
      `${this.gitHubUrl}/orgs/${org}/repos?type=public`,
    getBranches: (username: string, repo: string) =>
      `${this.gitHubUrl}/repos/${username}/${repo}/branches`,
  };

  public constructor(private httpService: HttpService) {}

  public async getUser(username: string): Promise<User> {
    const url: string = this.gitHubEndpoints.getUser(username);
    const result = await this.httpService
      .get(url, {
        headers: this.headers,
      })
      .toPromise()
      .catch((err) => {
        if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            message: 'User not found',
          });
        }
        throw err;
      });

    const user = new User(
      result.data.login,
      result.data.type === UserTypeEnum.Organization,
    );

    return user;
  }

  public async getNotForkRepos(user: User): Promise<Repository[]> {
    const url: string = user.isOrg
      ? this.gitHubEndpoints.getOrgReposList(user.login)
      : this.gitHubEndpoints.getUserReposList(user.login);
    const result = await this.httpService
      .get(url, {
        headers: this.headers,
      })
      .toPromise();
    const repos = result.data.filter((repo) => !repo.fork);
    return repos.map((repo) => new Repository(repo.name, repo.owner.login));
  }

  public async getBranches(user: User, repo: Repository): Promise<Branch[]> {
    const url: string = this.gitHubEndpoints.getBranches(
      user.login,
      repo.repository_name,
    );
    const result = await this.httpService
      .get(url, {
        headers: this.headers,
      })
      .toPromise();
    return result.data.map(
      (branch) => new Branch(branch.name, branch.commit.sha),
    );
  }
}
