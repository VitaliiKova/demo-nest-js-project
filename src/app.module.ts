import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { GitHubController } from './controllers/github.controller';
import { AppService } from './services/app.service';
import { GithubService } from './services/github.service';
import { HttpModule } from '@nestjs/axios';
import { CheckHeaderAcceptMiddleware } from './middleware/check-header-accept-middleware.service';
import { HeadersBuilder } from './services/headers-builder';
import { GithubApiClientService } from './services/github-api-client';

@Module({
  imports: [HttpModule],
  controllers: [AppController, GitHubController],
  providers: [
    AppService,
    GithubService,
    HeadersBuilder,
    GithubApiClientService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckHeaderAcceptMiddleware).forRoutes(GitHubController);
  }
}
