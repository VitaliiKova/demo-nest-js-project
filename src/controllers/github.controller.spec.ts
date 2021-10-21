import { Test, TestingModule } from '@nestjs/testing';
import { GitHubController } from './github.controller';
import { GithubApiService } from '../services/github-api.service';
import { AxiosError, AxiosResponse } from 'axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { of, throwError } from 'rxjs';
import { HttpService, HttpModule } from '@nestjs/axios';
import * as request from 'supertest';
import { GitHubUtil } from '../utils/github.util';

describe('Test GitHubController', () => {
  let gitHubController: GitHubController;
  let httpService: HttpService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [GitHubController],
      providers: [GithubApiService, GitHubUtil],
    }).compile();

    httpService = app.get<HttpService>(HttpService);

    gitHubController = app.get<GitHubController>(GitHubController);
  });

  describe('GitHub Controller tests', () => {
    it('getGitHubRepos should return all GitHub Repositories for USER', async () => {
      const axiosResFields = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      const userGitHubResponse: AxiosResponse = {
        data: {
          login: 'vitalii',
          type: UserTypeEnum.User,
        },
        ...axiosResFields,
      };
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
        ...axiosResFields,
      };
      const branchGitHubResponse: AxiosResponse = {
        data: [
          {
            name: 'master',
            commit: {
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          },
        ],
        ...axiosResFields,
      };
      const mockResponse = [
        {
          repository_name: 'repo-test-2',
          owner_login: 'vitalii',
          branches: [
            {
              name: 'master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(userGitHubResponse))
        .mockImplementationOnce(() => of(repositoryGitHubResponse))
        .mockImplementationOnce(() => of(branchGitHubResponse));

      const result = await gitHubController.getGitHubRepos('vitalii');
      expect(result.length).toBe(1);
      expect(mockResponse);
    });

    it('getGitHubRepos should return all GitHub Repositories for ORGANIZATION', async () => {
      const axiosResFields = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      const userGitHubResponse: AxiosResponse = {
        data: {
          login: 'vitaliiOrganization',
          type: UserTypeEnum.Organization,
        },
        ...axiosResFields,
      };
      const repositoryGitHubResponse: AxiosResponse = {
        data: [
          {
            name: 'org-repo-test-1',
            fork: true,
            owner: {
              login: 'vitaliiOrganization',
            },
          },
          {
            name: 'org-repo-test-2',
            fork: false,
            owner: {
              login: 'vitaliiOrganization',
            },
          },
        ],
        ...axiosResFields,
      };
      const branchGitHubResponse: AxiosResponse = {
        data: [
          {
            name: 'org-master',
            commit: {
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          },
        ],
        ...axiosResFields,
      };
      const mockResponse = [
        {
          repository_name: 'org-repo-test-2',
          owner_login: 'vitaliiOrganization',
          branches: [
            {
              name: 'org-master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(userGitHubResponse))
        .mockImplementationOnce(() => of(repositoryGitHubResponse))
        .mockImplementationOnce(() => of(branchGitHubResponse));

      const result = await gitHubController.getGitHubRepos('vitalii');
      expect(result.length).toBe(1);
      expect(mockResponse);
    });

    it('getGitHubRepos should return 404 error for invalid username', async () => {
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
      const errorResponse = {
        status: 404,
        message: 'User not found',
      };

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => throwError(err));

      try {
        await gitHubController.getGitHubRepos('vitalii');
        fail('should throw');
      } catch (e) {
        expect(errorResponse);
      }
    });

    it('getGitHubRepos should return empty response for USER', async () => {
      const axiosResFields = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
      const userGitHubResponse: AxiosResponse = {
        data: {
          login: 'vitalii',
          type: UserTypeEnum.User,
        },
        ...axiosResFields,
      };
      const repositoryGitHubResponse: AxiosResponse = {
        data: [],
        ...axiosResFields,
      };
      const emptyResponse = [];

      jest
        .spyOn(httpService, 'get')
        .mockImplementationOnce(() => of(userGitHubResponse))
        .mockImplementationOnce(() => of(repositoryGitHubResponse));

      const result = await gitHubController.getGitHubRepos('vitalii');
      expect(emptyResponse);
    });
  });
});
