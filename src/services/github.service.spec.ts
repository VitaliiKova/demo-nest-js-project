import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { User } from '../model/user';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { Repository } from '../model/repository';
import { Branch } from '../model/branch';
import { HeadersForGit } from '../model/headers-for-git';
import { ConfigKey } from '../config/config-key.enum';
import DoneCallback = jest.DoneCallback;
import { GithubApiClientService } from './github-api-client';
import { HeadersBuilder } from './headers-builder';
import { HttpStatus } from '@nestjs/common';

describe('Test GithubService', () => {
  let githubApiService: GithubService;
  let httpService: HttpService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GithubService, HeadersBuilder, GithubApiClientService],
    }).compile();

    httpService = app.get<HttpService>(HttpService);
    githubApiService = app.get<GithubService>(GithubService);
  });

  it('getUser function should return valid user', (done: DoneCallback) => {
    const userGitHubResponse: AxiosResponse = {
      data: {
        login: 'vitalii',
        type: UserTypeEnum.User,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(userGitHubResponse));

    githubApiService.getUser('vitalii', mockHeaders).subscribe(
      (userResponce: User) => {
        expect(userResponce).toEqual({
          login: 'vitalii',
          isOrg: false,
        });
        done();
      },
      (error: Error) => done.fail(error),
    );
  });

  it('getUser function should return valid organization', (done: DoneCallback) => {
    const orgGitHubResponse: AxiosResponse = {
      data: {
        login: 'vitaliiOrg',
        type: UserTypeEnum.Organization,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(orgGitHubResponse));

    githubApiService.getUser('vitaliiOrg', mockHeaders).subscribe(
      (orgResponce: User) => {
        expect(orgResponce).toEqual({
          login: 'vitaliiOrg',
          isOrg: true,
        });
        done();
      },
      (error: Error) => done.fail(error),
    );
  });

  it('getUser function should return error 404 ', (done: DoneCallback) => {
    const err: Partial<AxiosError> = {
      response: {
        status: 404,
        statusText: 'Not Found',
        data: {
          message: 'Not Found',
          documentation_url:
            'https://docs.github.com/rest/reference/users#get-a-user',
        },
        headers: {},
        config: {},
      },
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => throwError(err));

    githubApiService.getUser('vitalii', mockHeaders).subscribe(
      (next: User) => {
        done.fail('should throw 404 Error');
      },
      (error: any) => {
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
        expect(error.message).toEqual('GitHub user not found');
        done();
      },
    );
  });

  it('getUser function should return unexpected error 400 ', (done: DoneCallback) => {
    const err: Partial<AxiosError> = {
      response: {
        status: 400,
        statusText: 'Bad request',
        data: {
          message: 'Bad request',
          documentation_url:
            'https://docs.github.com/rest/reference/users#get-a-user',
        },
        headers: {},
        config: {},
      },
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => throwError(err));

    githubApiService.getUser('vitalii', mockHeaders).subscribe(
      (next: User) => {
        done.fail('should throw 400 Error');
      },
      (error: any) => {
        expect(error).toEqual(err);
        done();
      },
    );
  });

  it('getNotForkRepos function should return valid not fork repositories for USER', (done: DoneCallback) => {
    const repositoryGitHubResponse: AxiosResponse = {
      data: [
        {
          name: 'repo-test-1',
          fork: true,
          owner: {
            login: 'vitalii',
          },
        },
        {
          name: 'repo-test-2',
          fork: false,
          owner: {
            login: 'vitalii',
          },
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    const repoResponse: Repository = {
      repository_name: 'repo-test-2',
      owner_login: 'vitalii',
      branches: [],
    };
    const mockUser: User = {
      login: 'vitalii',
      isOrg: false,
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(repositoryGitHubResponse));

    githubApiService.getNotForkRepos(mockUser, mockHeaders).subscribe(
      (reposResponce: Repository[]) => {
        expect(reposResponce.length).toEqual(1);
        expect(reposResponce[0]).toEqual(repoResponse);
        done();
      },
      (error: Error) => done.fail(error),
    );
  });

  it('getNotForkRepos function should return valid not fork repositories for ORGANIZATION', (done: DoneCallback) => {
    const orgRepositoryGitHubResponse: AxiosResponse = {
      data: [
        {
          name: 'org-repo-test-1',
          fork: true,
          owner: {
            login: 'vitaliiOrg',
          },
        },
        {
          name: 'org-repo-test-2',
          fork: false,
          owner: {
            login: 'vitaliiOrg',
          },
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    const repoResponse: Repository = {
      repository_name: 'org-repo-test-2',
      owner_login: 'vitaliiOrg',
      branches: [],
    };
    const mockUser: User = {
      login: 'vitaliiOrg',
      isOrg: true,
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(orgRepositoryGitHubResponse));

    githubApiService.getNotForkRepos(mockUser, mockHeaders).subscribe(
      (reposResponce: Repository[]) => {
        expect(reposResponce.length).toEqual(1);
        expect(reposResponce[0]).toEqual(repoResponse);
        done();
      },
      (error: Error) => done.fail(error),
    );
  });

  it('getBranches function should return valid branches', (done: DoneCallback) => {
    const branchGitHubResponse: AxiosResponse = {
      data: [
        {
          name: 'master',
          commit: {
            sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
          },
        },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    const branchResponse: Branch = {
      name: 'master',
      sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
    };
    const mockUser: User = {
      login: 'vitalii',
      isOrg: false,
    };
    const mockRepo: Repository = {
      repository_name: 'repo-test-2',
      owner_login: 'vitalii',
      branches: [],
    };
    const mockHeaders: HeadersForGit = {
      accept: ConfigKey.ACCEPT_ALLOWED,
    };

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(of(branchGitHubResponse));

    githubApiService.getBranches(mockUser, mockRepo, mockHeaders).subscribe(
      (reposResponce: Branch[]) => {
        expect(reposResponce.length).toEqual(1);
        expect(reposResponce[0]).toEqual(branchResponse);
        done();
      },
      (error: Error) => done.fail(error),
    );
  });
});
