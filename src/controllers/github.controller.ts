import { Controller, Get, Param, Headers } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { Repository } from '../model/repository';
import { HeadersBuilder } from '../services/headers-builder';

@Controller('/api')
export class GitHubController {
  constructor(
    private readonly gitHubService: GithubService,
    private readonly headersBuilder: HeadersBuilder,
  ) {}

  @Get('/repositories/:userName')
  async getGitHubRepos(
    @Param('userName') userName: string,
    @Headers() headers,
  ): Promise<Repository[]> {
    const headersForGitHub = this.headersBuilder.getHeadersForGitHub(headers);
    const user = await this.gitHubService.getUser(userName, headersForGitHub);
    const repos = await this.gitHubService.getNotForkRepos(user, headersForGitHub);

    const result = await this.gitHubService.setBranchesToRepos(repos, user, headersForGitHub);

    return result;
  }
}
