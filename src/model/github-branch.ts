export interface GithubBranch {
  name: string;
  commit: {
    sha: string;
  };
}
