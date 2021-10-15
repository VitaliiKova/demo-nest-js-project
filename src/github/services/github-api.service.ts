import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { map } from 'rxjs/operators';
import { GitRepository } from '../model/git-repository';

@Injectable()
export class GithubApiService {
  private readonly gitHubUrl = 'https://api.github.com';

  private readonly gitHubEndpoints = {
    getUser: (username: string) => `${this.gitHubUrl}/users/${username}`,
    getUserReposList: (username: string) =>
      `${this.gitHubUrl}/users/${username}/repos`,
    getOrgReposList: (org: string) =>
      `${this.gitHubUrl}/orgs/${org}/repos?type=public`,
    getBranches: (owner: string, repo: string) =>
      `${this.gitHubUrl}/repos/${owner}/${repo}/branches`,
  };

  public constructor(private httpService: HttpService) {}

  getTestResponse(username: string): GitRepository[] {
    const mockData: GitRepository[] = [
      {
        repository_name: 'testName',
        owner_login: 'testLogin',
        branches: [
          {
            name: 'test branches name',
            commit: {
              sha: 'test sha',
            },
          },
        ],
      },
    ];
    return mockData;
  }

  getNotForkRepos(username: string, isOrg: boolean): Promise<AxiosResponse> {
    const url = isOrg
      ? this.gitHubEndpoints.getOrgReposList(username)
      : this.gitHubEndpoints.getUserReposList(username);
    return this.httpService
      .get(url)
      .pipe(
        map((res) => res.data),
        map((repos) => repos.filter((repo) => !repo.fork)),
      )
      .toPromise();
  }
}
