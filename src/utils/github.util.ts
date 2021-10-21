import { Injectable } from '@nestjs/common';
import { User } from '../model/user';
import { Repository } from '../model/repository';
import { GithubApiService } from '../services/github-api.service';

@Injectable()
export class GitHubUtil {
  constructor(private readonly gitHubService: GithubApiService) {}

  public async setBranchesToRepos(
    repos: Repository[],
    user: User,
  ): Promise<Repository[]> {
    const promises = [];
    repos.forEach((repo) => {
      promises.push(
        (async (repo) => {
          const branches = await this.gitHubService.getBranches(user, repo);
          repo.setBranches(branches);
        })(repo),
      );
    });

    /*promises.push(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject();
        }, 1000);
      }),
    );*/

    await Promise.all(promises);

    return repos;
  }
}
