import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from './entities/message.entity';
import { Match } from '../matches/entities/match.entity';

export interface SendMessageDto {
  matchId: string;
  content: string;
  type?: MessageType;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Message> {
    const match = await this.matchRepo.findOne({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match not found');
    if (match.user1Id !== senderId && match.user2Id !== senderId) {
      throw new ForbiddenException('Not part of this match');
    }

    const message = await this.messageRepo.save(
      this.messageRepo.create({
        matchId: dto.matchId,
        senderId,
        content: dto.content,
        type: dto.type || MessageType.TEXT,
      }),
    );

    // Update match stats
    await this.matchRepo.update(dto.matchId, {
      messageCount: () => '"messageCount" + 1',
      lastMessageAt: new Date(),
    });

    return message;
  }

  async getMessages(matchId: string, userId: string, before?: string, limit = 50) {
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new ForbiddenException('Access denied');
    }

    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where('m.matchId = :matchId', { matchId })
      .andWhere('m.isDeleted = false')
      .orderBy('m.createdAt', 'DESC')
      .limit(limit);

    if (before) {
      const pivot = await this.messageRepo.findOne({ where: { id: before } });
      if (pivot) qb.andWhere('m.createdAt < :ts', { ts: pivot.createdAt });
    }

    const messages = await qb.getMany();
    return messages.reverse();
  }

  async markRead(matchId: string, userId: string) {
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where('matchId = :matchId', { matchId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    const reactions = message.reactions || [];
    const existing = reactions.findIndex((r) => r.userId === userId);
    if (existing >= 0) reactions[existing].emoji = emoji;
    else reactions.push({ userId, emoji });
    message.reactions = reactions;
    return this.messageRepo.save(message);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) throw new ForbiddenException();
    message.isDeleted = true;
    message.content = '[deleted]';
    return this.messageRepo.save(message);
  }
}
