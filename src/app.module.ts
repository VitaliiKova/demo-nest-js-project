import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { GitHubController } from './controllers/github.controller';
import { AppService } from './services/app.service';
import { GithubService } from './services/github.service';
import { HttpModule } from '@nestjs/axios';
import { checkHeaderAcceptMiddleware } from './middleware/check-header-accept.middleware';
import { HeadersBuilder } from './services/headers-builder';

@Module({
  imports: [HttpModule],
  controllers: [AppController, GitHubController],
  providers: [AppService, GithubService, HeadersBuilder],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(checkHeaderAcceptMiddleware).forRoutes(GitHubController);
  }
}
