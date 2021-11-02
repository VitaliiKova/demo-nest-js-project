import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error-handling/error-handler';
import * as path from 'path';
import * as YAML from 'yamljs';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  const openapiSpecPath = path.resolve(__dirname, './swagger/api-doc.yaml');
  if (fs.existsSync(openapiSpecPath)) {
    const document = YAML.parseFile(openapiSpecPath);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'Github User Repositories',
    });
  }

  await app.listen(3000);
}

bootstrap();
