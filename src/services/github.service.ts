import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { Branch } from '../model/branch';
import { HeadersForGit } from '../model/headers-for-git';
import { ConfigKey } from '../config/config-key.enum';

@Injectable()
export class GithubService {
  private readonly gitHubUrl = ConfigKey.GITHUB_URL;

  private readonly gitHubEndpoints = {
    getUserUrl: (username: string) => `${this.gitHubUrl}/users/${username}`,
    getUserReposListUrl: (username: string) =>
      `${this.gitHubUrl}/users/${username}/repos`,
    getOrgReposListUrl: (org: string) =>
      `${this.gitHubUrl}/orgs/${org}/repos?type=public`,
    getBranchesUrl: (username: string, repo: string) =>
      `${this.gitHubUrl}/repos/${username}/${repo}/branches`,
  };

  public constructor(private httpService: HttpService) {}

  public async getUser(
    username: string,
    headers: HeadersForGit,
  ): Promise<User> {
    const url: string = this.gitHubEndpoints.getUserUrl(username);

    const result = await this.httpService
      .get(url, {
        headers: headers,
      })
      .toPromise()
      .catch((err) => {
        if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            message: 'GitHub user not found',
          });
        }
        throw err;
      });

    const user: User = {
      login: result.data.login,
      isOrg: result.data.type === UserTypeEnum.Organization,
    };

    return user;
  }

  public async getNotForkRepos(
    user: User,
    headers: HeadersForGit,
  ): Promise<Repository[]> {
    const url: string = user.isOrg
      ? this.gitHubEndpoints.getOrgReposListUrl(user.login)
      : this.gitHubEndpoints.getUserReposListUrl(user.login);

    const result = await this.httpService
      .get(url, {
        headers: headers,
      })
      .toPromise();

    return result.data
      .filter((repo) => !repo.fork)
      .map((repo) => {
        return <Repository>{
          repository_name: repo.name,
          owner_login: repo.owner.login,
          branches: [],
        };
      });
  }

  public async getBranches(
    user: User,
    repo: Repository,
    headers: HeadersForGit,
  ): Promise<Branch[]> {
    const url: string = this.gitHubEndpoints.getBranchesUrl(
      user.login,
      repo.repository_name,
    );

    const result = await this.httpService
      .get(url, {
        headers: headers,
      })
      .toPromise();

    return result.data.map((branch) => {
      return <Branch>{
        name: branch.name,
        sha: branch.commit.sha,
      };
    });
  }

  public async setBranchesToRepos(
    repos: Repository[],
    user: User,
    headersForGitHub: HeadersForGit,
  ): Promise<Repository[]> {
    const promises = [];
    repos.forEach((repo) => {
      promises.push(
        (async (repo) => {
          const branches = await this.getBranches(user, repo, headersForGitHub);
          repo.branches = branches;
        })(repo),
      );
    });

    /*promises.push(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject();
        }, 1000);
      }),
    );*/

    await Promise.all(promises);

    return repos;
  }
}
