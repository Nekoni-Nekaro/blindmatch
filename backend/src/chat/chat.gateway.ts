import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService, SendMessageDto } from './chat.service';
import { MessageType } from './entities/message.entity';

interface AuthSocket extends Socket {
  userId: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      client.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      this.logger.log(`Connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
      this.logger.log(`Disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('join_match')
  handleJoinMatch(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string },
  ) {
    client.join(`match:${data.matchId}`);
    return { event: 'joined', data: { matchId: data.matchId } };
  }

  @SubscribeMessage('leave_match')
  handleLeaveMatch(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string },
  ) {
    client.leave(`match:${data.matchId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string; content: string; type?: MessageType },
  ) {
    try {
      const message = await this.chatService.sendMessage(client.userId, {
        matchId: data.matchId,
        content: data.content,
        type: data.type,
      });

      // Broadcast to match room
      this.server.to(`match:${data.matchId}`).emit('new_message', message);
      return { event: 'message_sent', data: message };
    } catch (e) {
      return { event: 'error', data: { message: e.message } };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string; isTyping: boolean },
  ) {
    client.to(`match:${data.matchId}`).emit('typing', {
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('read_messages')
  async handleRead(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { matchId: string },
  ) {
    await this.chatService.markRead(data.matchId, client.userId);
    client.to(`match:${data.matchId}`).emit('messages_read', {
      userId: client.userId,
      matchId: data.matchId,
    });
  }

  @SubscribeMessage('react')
  async handleReact(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { messageId: string; emoji: string; matchId: string },
  ) {
    const message = await this.chatService.addReaction(data.messageId, client.userId, data.emoji);
    this.server.to(`match:${data.matchId}`).emit('reaction_added', message);
  }

  // Push to specific user (for match notifications etc.)
  emitToUser(userId: string, event: string, payload: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) this.server.to(socketId).emit(event, payload);
  }
}
