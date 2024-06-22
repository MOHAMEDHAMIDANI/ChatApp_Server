import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });
  app.use(cookieParser());

  // Use dynamic import for graphql-upload-minimal
  const { graphqlUploadExpress } = await import('graphql-upload-minimal');
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 5 }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        // const formattedErrors = errors.reduce((accumulator, error) => {
        //   accumulator[error.property] = Object.values(error.constraints).join(', ');
        //   return accumulator;
        // }, {});
        console.error(errors);  // Log errors directly
        throw new BadRequestException(errors);
        // throw new BadRequestException(formattedErrors);
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
