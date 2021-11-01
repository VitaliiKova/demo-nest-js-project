import { Controller, Get, Param, Headers } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { Repository } from '../model/repository';
import { Observable } from 'rxjs';

@Controller('/api')
export class GitHubController {
  constructor(private readonly gitHubService: GithubService) {}

  @Get('/repositories/:userName')
  getGitHubRepos(
    @Param('userName') userName: string,
    @Headers() headers,
  ): Observable<Repository[]> {
    return this.gitHubService.getAllRepos(userName, headers);
  }
}
