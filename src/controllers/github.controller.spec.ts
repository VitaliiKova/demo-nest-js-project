import { Test, TestingModule } from '@nestjs/testing';
import { GitHubController } from './github.controller';
import { GithubService } from '../services/github.service';
import { of, throwError } from 'rxjs';
import { HttpService, HttpModule } from '@nestjs/axios';
import { HeadersForGit } from '../model/headers-for-git';
import { ConfigKey } from '../config/config-key.enum';
import { HeadersBuilder } from '../services/headers-builder';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { GithubApiClientService } from '../services/github-api-client';
import DoneCallback = jest.DoneCallback;
import { HttpStatus } from '@nestjs/common';

describe('Test GitHubController', () => {
  let gitHubController: GitHubController;
  let httpService: HttpService;
  let githubService: GithubService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [GitHubController],
      providers: [GithubService, HeadersBuilder, GithubApiClientService],
    }).compile();

    httpService = app.get<HttpService>(HttpService);

    gitHubController = app.get<GitHubController>(GitHubController);
    githubService = app.get<GithubService>(GithubService);
  });

  describe('GitHub Controller tests', () => {
    it('getGitHubRepos should return all GitHub Repositories for USER', (done: DoneCallback) => {
      const userResponse: User = {
        login: 'vitalii',
        isOrg: false,
      };
      const repositoryResponse: Repository[] = [
        {
          repository_name: 'repo-test-1',
          owner_login: 'vitalii',
          branches: [
            {
              name: 'master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];
      const mockResponse = [
        {
          repository_name: 'repo-test-1',
          owner_login: 'vitalii',
          branches: [
            {
              name: 'master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];
      const mockHeadersReq: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'authtokentest1234',
      };
      const mockHeadersRes: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'token authtokentest1234',
      };

      jest
        .spyOn(githubService, 'getUser')
        .mockReturnValueOnce(of(userResponse));

      jest
        .spyOn(githubService, 'getNotForkRepos')
        .mockReturnValueOnce(of(repositoryResponse));

      gitHubController.getGitHubRepos('vitalii', mockHeadersReq).subscribe(
        (testResponse: Repository[]) => {
          expect(testResponse).toEqual(mockResponse);
          expect(githubService.getUser).toBeCalledWith(
            'vitalii',
            mockHeadersRes,
          );
          expect(githubService.getNotForkRepos).toBeCalledWith(
            userResponse,
            mockHeadersRes,
          );
          done();
        },
        (error: Error) => done.fail(error),
      );
    });

    it('getGitHubRepos should return all GitHub Repositories for ORGANIZATION', (done: DoneCallback) => {
      const userResponse: User = {
        login: 'vitaliiOrganization',
        isOrg: true,
      };
      const repositoryResponse: Repository[] = [
        {
          repository_name: 'org-repo-test-1',
          owner_login: 'vitaliiOrganization',
          branches: [
            {
              name: 'org-master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];
      const mockResponse = [
        {
          repository_name: 'org-repo-test-1',
          owner_login: 'vitaliiOrganization',
          branches: [
            {
              name: 'org-master',
              sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
            },
          ],
        },
      ];
      const mockHeadersReq: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'authtokentest1234',
      };
      const mockHeadersRes: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'token authtokentest1234',
      };

      jest
        .spyOn(githubService, 'getUser')
        .mockReturnValueOnce(of(userResponse));

      jest
        .spyOn(githubService, 'getNotForkRepos')
        .mockReturnValueOnce(of(repositoryResponse));

      gitHubController
        .getGitHubRepos('vitaliiOrganization', mockHeadersReq)
        .subscribe(
          (testResponse: Repository[]) => {
            expect(testResponse).toEqual(mockResponse);
            expect(githubService.getUser).toBeCalledWith(
              'vitaliiOrganization',
              mockHeadersRes,
            );
            expect(githubService.getNotForkRepos).toBeCalledWith(
              userResponse,
              mockHeadersRes,
            );
            done();
          },
          (error: Error) => done.fail(error),
        );
    });

    it('getGitHubRepos should return 404 error for invalid username', (done: DoneCallback) => {
      const errorResponse = {
        status: HttpStatus.NOT_FOUND,
        message: 'GitHub user not found',
      };
      const mockHeaders: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
      };

      jest
        .spyOn(githubService, 'getUser')
        .mockImplementationOnce(() => throwError(errorResponse));
      jest.spyOn(githubService, 'getNotForkRepos').mockReturnValueOnce(of([]));
      jest.spyOn(githubService, 'getBranches').mockReturnValueOnce(of([]));

      gitHubController.getGitHubRepos('vitalii', mockHeaders).subscribe(
        (next: Repository[]) => {
          done.fail('should throw 404 Error');
        },
        (error: Error) => {
          expect(error).toEqual(errorResponse);
          expect(githubService.getUser).toBeCalled();
          expect(githubService.getNotForkRepos).not.toBeCalled();
          expect(githubService.getBranches).not.toBeCalled();
          done();
        },
      );
    });

    it('getGitHubRepos should return empty response for USER', (done: DoneCallback) => {
      const userResponse: User = {
        login: 'vitalii',
        isOrg: false,
      };
      const repositoryResponse: Repository[] = [];

      const mockHeadersReq: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'authtokentest1234',
      };
      const mockHeadersRes: HeadersForGit = {
        accept: ConfigKey.ACCEPT_ALLOWED,
        authorization: 'token authtokentest1234',
      };

      jest
        .spyOn(githubService, 'getUser')
        .mockReturnValueOnce(of(userResponse));

      jest
        .spyOn(githubService, 'getNotForkRepos')
        .mockReturnValueOnce(of(repositoryResponse));

      gitHubController.getGitHubRepos('vitalii', mockHeadersReq).subscribe(
        (testResponse: Repository[]) => {
          expect(testResponse).toEqual([]);
          expect(githubService.getUser).toBeCalledWith(
            'vitalii',
            mockHeadersRes,
          );
          expect(githubService.getNotForkRepos).toBeCalledWith(
            userResponse,
            mockHeadersRes,
          );
          done();
        },
        (error: Error) => done.fail(error),
      );
    });
  });
});
