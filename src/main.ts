import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure Express to handle raw body for webhooks
  app.use(express.json({
    verify: (req: any, res, buf) => {
      // Make raw body available for webhook signature verification
      req.rawBody = buf;
    }
  }));
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // CORS with credentials support
  app.enableCors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', "https://rabbitholegames.africa/"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
