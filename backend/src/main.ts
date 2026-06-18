import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Security
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
  }));
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: configService.get('APP_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger (dev only)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BlindMatch API')
      .setDescription('Dating platform API — personality first, then looks')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication & authorization')
      .addTag('users', 'User management')
      .addTag('profiles', 'Profile & tags')
      .addTag('matches', 'Matching & likes')
      .addTag('chat', 'Real-time messaging')
      .addTag('rooms', 'Interest rooms')
      .addTag('ai', 'AI compatibility analysis')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`BlindMatch API running on port ${port}`);
  if (nodeEnv !== 'production') {
    console.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
