import { Test, TestingModule } from '@nestjs/testing';
import { GitHubController } from './github.controller';
import { GithubApiService } from '../services/github-api.service';

describe('Test GitHubController', () => {
  let gitHubController: GitHubController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GitHubController],
      providers: [GithubApiService],
    }).compile();

    gitHubController = app.get<GitHubController>(GitHubController);
  });

  /*describe('GitHub Controller tests', () => {
    it('should return GitHub Repositories for user by username', () => {
      const result = gitHubController.getGitHubRepos(
        'TestUserName',
      ) as GitRepository[];
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].repository_name);
      expect(result[0].owner_login);
      expect(result[0].branches);
      expect(result[0].branches.length);
      expect(result[0].branches[0].name);
      expect(result[0].branches[0].sha);
    });
  });*/
});
