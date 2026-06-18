import {
  Controller, Get, Post, Delete, Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { User } from '../users/entities/user.entity';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MessageType } from './entities/message.entity';

class SendMessageBodyDto {
  @IsString() content: string;
  @IsOptional() @IsEnum(MessageType) type?: MessageType;
}

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':matchId/messages')
  @ApiOperation({ summary: 'Get messages for a match (paginated)' })
  getMessages(
    @Param('matchId') matchId: string,
    @CurrentUser() user: User,
    @Query('before') before?: string,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(matchId, user.id, before, +limit);
  }

  @Post(':matchId/messages')
  @ApiOperation({ summary: 'Send a message (REST fallback)' })
  sendMessage(
    @Param('matchId') matchId: string,
    @CurrentUser() user: User,
    @Body() body: SendMessageBodyDto,
  ) {
    return this.chatService.sendMessage(user.id, { matchId, ...body });
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own message' })
  deleteMessage(@Param('messageId') messageId: string, @CurrentUser() user: User) {
    return this.chatService.deleteMessage(messageId, user.id);
  }
}
