import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { AxiosResponse } from 'axios';
import { UserTypeEnum } from '../model/user-types.enum';
import { of } from 'rxjs';

describe('Check header accept middleware', () => {
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

  it('middleware should return 406 error for invalid Accept', () => {
    const errorResponse = {
      status: 406,
      message: 'Not Acceptable',
    };

    return request(app.getHttpServer())
      .get('/api/repositories/vitalii')
      .set('Accept', 'application/xml')
      .expect(errorResponse);
  });

  it('middleware should pass valid Accept', () => {
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
