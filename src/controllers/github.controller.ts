import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { GithubApiService } from '../services/github-api.service';
import { Repository } from '../model/repository';
import { GitHubUtil } from '../utils/github.util';

@Controller('/api')
export class GitHubController {
  constructor(
    private readonly gitHubService: GithubApiService,
    private readonly gitHubUtil: GitHubUtil,
  ) {}

  @Get('/repositories/:userName')
  async getGitHubRepos(
    @Param('userName') userName: string,
  ): Promise<Repository[]> {
    const user = await this.gitHubService.getUser(userName);
    const repos = await this.gitHubService.getNotForkRepos(user);
    const result = await this.gitHubUtil.setBranchesToRepos(repos, user);

    return result;
  }
}
