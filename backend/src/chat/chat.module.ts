import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from './entities/message.entity';
import { Match } from '../matches/entities/match.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Match]), UsersModule],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
