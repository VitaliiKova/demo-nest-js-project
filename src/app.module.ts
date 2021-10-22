import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { GitHubController } from './controllers/github.controller';
import { AppService } from './services/app.service';
import { GithubApiService } from './services/github-api.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { checkHeaderAcceptMiddleware } from './middleware/check-header-accept.middleware';
import { GitHubUtil } from './utils/github.util';
import { HeadersBuilder } from './services/headers-builder';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, GitHubController],
  providers: [AppService, GithubApiService, GitHubUtil, HeadersBuilder],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(checkHeaderAcceptMiddleware).forRoutes(GitHubController);
  }
}
