import { Controller, Get, Param } from '@nestjs/common';
import { GithubApiService } from '../services/github-api.service';
import { Repository } from '../model/repository';

@Controller('/api')
export class GitHubController {
  constructor(private readonly gitHubService: GithubApiService) {}

  @Get('/repositories/:userName')
  async getGitHubRepos(
    @Param('userName') userName: string,
  ): Promise<Repository[]> {
    const user = await this.gitHubService.getUser(userName);
    const repos = await this.gitHubService.getNotForkRepos(user);

    const promises = [];
    repos.forEach((repo) => {
      promises.push(
        (async (repo) => {
          const branches = await this.gitHubService.getBranches(user, repo);
          repo.setBranches(branches);
        })(repo),
      );
    });

    await Promise.all(promises);

    return repos;
  }
}
