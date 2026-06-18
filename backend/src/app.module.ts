import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { RoomsModule } from './rooms/rooms.module';
import { AiModule } from './ai/ai.module';
import { FilesModule } from './files/files.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USERNAME', 'blindmatch'),
        password: cfg.get('DB_PASSWORD', 'blindmatch_secret'),
        database: cfg.get('DB_DATABASE', 'blindmatch_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: cfg.get('NODE_ENV') === 'development',
        ssl: cfg.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => [
        {
          ttl: cfg.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: cfg.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    AuthModule,
    UsersModule,
    ProfilesModule,
    MatchesModule,
    ChatModule,
    RoomsModule,
    AiModule,
    FilesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  controllers: [HealthController],
})
export class AppModule {}
