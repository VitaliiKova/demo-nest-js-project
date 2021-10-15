import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubApiService } from './services/github-api.service';

@Module({
  imports: [HttpModule],
  providers: [GithubApiService],
})
export class GithubModule {}
