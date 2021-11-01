export interface GithubRepository {
  name: string;
  fork: boolean;
  owner: {
    login: string;
  };
}
