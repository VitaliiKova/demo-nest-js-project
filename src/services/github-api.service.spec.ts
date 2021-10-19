import { Test, TestingModule } from '@nestjs/testing';
import { GithubApiService } from '../services/github-api.service';
import { GitRepository } from '../model/git-repository';
import { User } from '../model/user';
import { HttpModule } from '@nestjs/axios';
import { HttpStatus, NotFoundException } from '@nestjs/common';

describe('Test GithubApiService', () => {
  let githubApiService: GithubApiService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GithubApiService],
    }).compile();

    githubApiService = app.get<GithubApiService>(GithubApiService);
  });

  it('getUser function should return valid user', async () => {
    const mockUser: User = new User('usernameTest', false);
    jest.spyOn(githubApiService, 'getUser').mockResolvedValue(mockUser);
    const user = (await githubApiService.getUser('usernameTest')) as User;
    expect(user.getLogin()).toEqual('usernameTest');
    expect(user.getIsOrg()).toEqual(false);
  });

  it('getUser function should return error 404 ', async () => {
    jest.spyOn(githubApiService, 'getUser').mockImplementation(() => {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    });
    try {
      await githubApiService.getUser('usernameTest');
      fail('should throw');
    } catch (e) {
      expect(e.status).toEqual(404);
      expect(e.message).toEqual('User not found');
    }
  });
});
