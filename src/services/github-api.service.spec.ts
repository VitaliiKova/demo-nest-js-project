import { Test, TestingModule } from '@nestjs/testing';
import { GithubApiService } from '../services/github-api.service';
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

describe('Test GithubApiService', () => {
  let githubApiService: GithubApiService;
  let httpService: HttpService;
  let configKey: ConfigKey;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GithubApiService],
    }).compile();

    httpService = app.get<HttpService>(HttpService);
    githubApiService = app.get<GithubApiService>(GithubApiService);
  });

  it('getUser function should return valid user', async () => {
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

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(userGitHubResponse));

    const user = (await githubApiService.getUser(
      'vitalii',
      mockHeaders,
    )) as User;
    expect(user.login).toEqual('vitalii');
    expect(user.isOrg).toEqual(false);
  });

  it('getUser function should return valid organization', async () => {
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

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(orgGitHubResponse));

    const user = (await githubApiService.getUser(
      'vitaliiOrg',
      mockHeaders,
    )) as User;
    expect(user.login).toEqual('vitaliiOrg');
    expect(user.isOrg).toEqual(true);
  });

  it('getUser function should return error 404 ', async () => {
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

    try {
      await githubApiService.getUser('usernameTest', mockHeaders);
      fail('should throw');
    } catch (e) {
      expect(e.status).toEqual(404);
      expect(e.message).toEqual('GitHub user not found');
    }
  });

  it('getUser function should return error unexpected error', async () => {
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

    try {
      await githubApiService.getUser('usernameTest', mockHeaders);
      fail('should throw');
    } catch (e) {
      expect(err);
    }
  });

  it('getNotForkRepos function should return valid not fork repositories for USER', async () => {
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
      .mockImplementationOnce(() => of(repositoryGitHubResponse));

    const repositories = (await githubApiService.getNotForkRepos(
      mockUser,
      mockHeaders,
    )) as Repository[];
    expect(repositories.length).toEqual(1);
    expect(repositories[0]).toEqual(repoResponse);
  });

  it('getNotForkRepos function should return valid not fork repositories for ORGANIZATION', async () => {
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
      .mockImplementationOnce(() => of(orgRepositoryGitHubResponse));

    const repositories = (await githubApiService.getNotForkRepos(
      mockUser,
      mockHeaders,
    )) as Repository[];
    expect(repositories.length).toEqual(1);
    expect(repositories[0]).toEqual(repoResponse);
  });

  it('getBranches function should return valid branches', async () => {
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
      .mockImplementationOnce(() => of(branchGitHubResponse));

    const branches = (await githubApiService.getBranches(
      mockUser,
      mockRepo,
      mockHeaders,
    )) as Branch[];

    expect(branches.length).toEqual(1);
    expect(branches[0]).toEqual(branchResponse);
  });
});
