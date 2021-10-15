import { Controller, Get, Param } from '@nestjs/common';
import { GithubApiService } from '../services/github-api.service';
import { GitRepository } from '../model/git-repository';

@Controller()
export class GitHubController {
  constructor(private readonly gitHubService: GithubApiService) {}

  @Get('/repositories/:userName')
  getGitHubRepos(@Param('userName') userName: string): GitRepository[] {
    return this.gitHubService.getTestResponse(userName);
  }

  /*@Get('/repositories/:userName')
  getGitHubRepos(@Params('userName') userName: string): string {
    return this.gitHubService.getNotForkRepos();
  }*/
}
