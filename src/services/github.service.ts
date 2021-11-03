import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { Branch } from '../model/branch';
import { HeadersForGit } from '../model/headers-for-git';
import { ConfigKey } from '../config/config-key.enum';
import {
  catchError,
  defaultIfEmpty,
  forkJoin,
  mergeMap,
  Observable,
  of,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubApiClientService } from './github-api-client';
import { GithubUser } from '../model/github-user';
import { GithubRepository } from '../model/github-repository';
import { GithubBranch } from '../model/github-branch';
import { HeadersBuilder } from './headers-builder';

@Injectable()
export class GithubService {
  constructor(
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
      mergeMap((user: User) => this.getNotForkRepos(user, headersForGitHub)),
    );
  }

  getUser(username: string, headers: HeadersForGit): Observable<User> {
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

  getNotForkRepos(
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
            return forkJoin({
              repository_name: of(repo.name),
              owner_login: of(repo.owner.login),
              branches: this.getBranches(user, repo.name, headers),
            });
          }),
        ),
        mergeMap((repos: Observable<Repository>[]) =>
          forkJoin(repos).pipe(defaultIfEmpty([])),
        ),
      );
  }

  getBranches(
    user: User,
    repoName: string,
    headers: HeadersForGit,
  ): Observable<Branch[]> {
    const url: string = this.gitHubEndpoints.getBranchesUrl(
      user.login,
      repoName,
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
}
