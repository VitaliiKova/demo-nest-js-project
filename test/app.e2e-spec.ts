import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AxiosResponse, AxiosError } from 'axios';
import { UserTypeEnum } from '../src/model/user-types.enum';
import { of, throwError } from 'rxjs';
import { ConfigKey } from '../src/config/config-key.enum';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nock = require('nock');

describe('Full api e2e tests', () => {
  let app: INestApplication;
  let httpService: HttpService;
  const gitHubUrl = ConfigKey.GITHUB_URL;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    httpService = moduleFixture.get<HttpService>(HttpService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
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
    nock(gitHubUrl)
      .get('/users/vitalii')
      .reply(200, {
        login: 'vitalii',
        type: UserTypeEnum.User,
      })
      .get('/users/vitalii/repos')
      .reply(200, [
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
      ])
      .get('/repos/vitalii/repo-test-2/branches')
      .reply(200, [
        {
          name: 'master',
          commit: {
            sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
          },
        },
      ]);

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK)
      .expect([
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
      ]);
  });

  it('/api/repositories/orgname (GET) success response with valid username and Accept for ORGANIZATION', () => {
    nock(gitHubUrl)
      .get('/users/vitaliiOrganization')
      .reply(200, {
        login: 'vitaliiOrganization',
        type: UserTypeEnum.Organization,
      })
      .get('/orgs/vitaliiOrganization/repos?type=public')
      .reply(200, [
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
      ])
      .get('/repos/vitaliiOrganization/org-repo-test-2/branches')
      .reply(200, [
        {
          name: 'org-master',
          commit: {
            sha: '57523742631876181d95bc268e09fb3fd1a4d85e',
          },
        },
      ]);

    return request(app.getHttpServer())
      .get('/api/repositories/vitaliiOrganization')
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK)
      .expect([
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
      ]);
  });

  it('/api/repositories/invalidname (GET) check 404 error for invalid username', () => {
    nock(gitHubUrl)
      .get('/users/invalidname')
      .reply(404, {
        response: {
          status: HttpStatus.NOT_FOUND,
          statusText: 'Not Found',
          data: {
            message: 'Not Found',
            documentation_url:
              'https://docs.github.com/rest/reference/users#get-a-user',
          },
          headers: {},
          config: {},
        },
      });

    return request(app.getHttpServer())
      .get('/api/repositories/invalidname')
      .set('Accept', 'application/json')
      .expect(HttpStatus.NOT_FOUND)
      .expect({
        status: HttpStatus.NOT_FOUND,
        message: 'GitHub user not found',
      });
  });

  it('/api/repositories/username (GET) check 406 error for invalid Accept', () => {
    const errorResponse = {
      status: HttpStatus.NOT_ACCEPTABLE,
      message:
        "Unsupported 'Accept' header: application/xml. Must accept 'application/json'",
    };

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/xml')
      .expect(HttpStatus.NOT_ACCEPTABLE)
      .expect(errorResponse);
  });

  it('/api/repositories/username (GET) check empty response for USER', () => {
    nock(gitHubUrl)
      .get('/users/vitalii')
      .reply(200, {
        login: 'vitalii',
        type: UserTypeEnum.User,
      })
      .get('/users/vitalii/repos')
      .reply(200, []);

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK)
      .expect([]);
  });
});
