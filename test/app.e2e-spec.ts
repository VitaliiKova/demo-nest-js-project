import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AxiosResponse, AxiosError } from 'axios';
import { UserTypeEnum } from '../src/model/user-types.enum';
import { of, throwError } from 'rxjs';

describe('Full api (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    httpService = moduleFixture.get<HttpService>(HttpService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Healthy!');
  });

  it('/api/repositories/username (GET) success response with valid username and Accept for USER', () => {
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

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(mockResponse);
  });

  it('/api/repositories/orgname (GET) success response with valid username and Accept for ORGANIZATION', () => {
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

    return request(app.getHttpServer())
      .get('/api/repositories/vitaliiOrganization')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(mockResponse);
  });

  it('/api/repositories/invalidname (GET) check 404 error for invalid username', () => {
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

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/json')
      .expect(404)
      .expect(errorResponse);
  });

  it('/api/repositories/username (GET) check 406 error for invalid Accept', () => {
    const errorResponse = {
      status: 406,
      message: 'Not Acceptable',
    };

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/xml')
      .expect(406)
      .expect(errorResponse);
  });

  it('/api/repositories/username (GET) check empty response for USER', () => {
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

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(emptyResponse);
  });
});
