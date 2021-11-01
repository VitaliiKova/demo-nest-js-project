import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { Branch } from '../model/branch';
import { HeadersForGit } from '../model/headers-for-git';
import { ConfigKey } from '../config/config-key.enum';
import { catchError, forkJoin, mergeMap, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubApiClientService } from './github-api-client';
import { GithubUser } from '../model/github-user';
import { GithubRepository } from '../model/github-repository';
import { GithubBranch } from '../model/github-branch';
import { HeadersBuilder } from './headers-builder';

@Injectable()
export class GithubService {
  public constructor(
    private readonly httpService: HttpService,
    private readonly githubApiClientService: GithubApiClientService,
    private readonly headersBuilder: HeadersBuilder,
  ) {}

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

  getAllRepos(userName: string, headers: any): Observable<Repository[]> {
    const headersForGitHub = this.headersBuilder.getHeadersForGitHub(headers);

    return this.getUser(userName, headersForGitHub).pipe(
      mergeMap((user) =>
        this.getNotForkRepos(user, headersForGitHub).pipe(
          mergeMap((repos) =>
            this.setBranchesToRepos([], user, headersForGitHub),
          ),
        ),
      ),
    );
  }

  private getUser(username: string, headers: HeadersForGit): Observable<User> {
    const url: string = this.gitHubEndpoints.getUserUrl(username);

    return this.githubApiClientService.get<GithubUser>(url, headers).pipe(
      catchError((err) => {
        if (err.response && err.response.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            message: 'GitHub user not found',
          });
        }
        throw err;
      }),
      map((user) => {
        return {
          login: user.login,
          isOrg: user.type === UserTypeEnum.Organization,
        };
      }),
    );
  }

  private getNotForkRepos(
    user: User,
    headers: HeadersForGit,
  ): Observable<Repository[]> {
    const url: string = user.isOrg
      ? this.gitHubEndpoints.getOrgReposListUrl(user.login)
      : this.gitHubEndpoints.getUserReposListUrl(user.login);

    return this.githubApiClientService
      .get<GithubRepository[]>(url, headers)
      .pipe(
        map((repos) => repos.filter((repo) => !repo.fork)),
        map((repos) =>
          repos.map((repo) => {
            return {
              repository_name: repo.name,
              owner_login: repo.owner.login,
              branches: [],
            };
          }),
        ),
      );
  }

  private getBranches(
    user: User,
    repo: Repository,
    headers: HeadersForGit,
  ): Observable<Branch[]> {
    const url: string = this.gitHubEndpoints.getBranchesUrl(
      user.login,
      repo.repository_name,
    );

    return this.githubApiClientService.get<GithubBranch[]>(url, headers).pipe(
      map((branches) =>
        branches.map((branch) => {
          return {
            name: branch.name,
            sha: branch.commit.sha,
          };
        }),
      ),
    );
  }

  private setBranchesToRepos(
    repos: Repository[],
    user: User,
    headersForGitHub: HeadersForGit,
  ): Observable<Repository[]> {
    const reposWithBranches = repos.map((repo, repoIdx) =>
      this.getBranches(user, repo, headersForGitHub).pipe(
        map((branches) => {
          repos[repoIdx].branches = branches;
          return repos[repoIdx];
        }),
      ),
    );
    return forkJoin(reposWithBranches);
  }
}
