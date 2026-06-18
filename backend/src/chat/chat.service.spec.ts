import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message, MessageType } from './entities/message.entity';
import { Match } from '../matches/entities/match.entity';

const mockMatch = {
  id: 'match-1',
  user1Id: 'user-1',
  user2Id: 'user-2',
  messageCount: 5,
};

const mockMessage = {
  id: 'msg-1',
  matchId: 'match-1',
  senderId: 'user-1',
  content: 'Hello!',
  type: MessageType.TEXT,
  isDeleted: false,
  reactions: [],
};

const mockMessageRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockMessage]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
  })),
};

const mockMatchRepo = {
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
        { provide: getRepositoryToken(Match), useValue: mockMatchRepo },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      mockMatchRepo.findOne.mockResolvedValue(mockMatch);
      mockMessageRepo.create.mockReturnValue(mockMessage);
      mockMessageRepo.save.mockResolvedValue(mockMessage);
      mockMatchRepo.update.mockResolvedValue({});

      const result = await service.sendMessage('user-1', {
        matchId: 'match-1',
        content: 'Hello!',
      });

      expect(result.content).toBe('Hello!');
      expect(mockMatchRepo.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if match not found', async () => {
      mockMatchRepo.findOne.mockResolvedValue(null);

      await expect(
        service.sendMessage('user-1', { matchId: 'bad-id', content: 'Hi' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user not in match', async () => {
      mockMatchRepo.findOne.mockResolvedValue(mockMatch);

      await expect(
        service.sendMessage('stranger', { matchId: 'match-1', content: 'Hi' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteMessage', () => {
    it('should soft-delete own message', async () => {
      mockMessageRepo.findOne.mockResolvedValue({ ...mockMessage });
      mockMessageRepo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.deleteMessage('msg-1', 'user-1');
      expect(result.isDeleted).toBe(true);
      expect(result.content).toBe('[deleted]');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockMessageRepo.findOne.mockResolvedValue({ ...mockMessage });

      await expect(
        service.deleteMessage('msg-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addReaction', () => {
    it('should add reaction to message', async () => {
      mockMessageRepo.findOne.mockResolvedValue({ ...mockMessage, reactions: [] });
      mockMessageRepo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.addReaction('msg-1', 'user-2', '❤️');
      expect(result.reactions).toContainEqual({ userId: 'user-2', emoji: '❤️' });
    });

    it('should update existing reaction from same user', async () => {
      mockMessageRepo.findOne.mockResolvedValue({
        ...mockMessage,
        reactions: [{ userId: 'user-2', emoji: '👍' }],
      });
      mockMessageRepo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.addReaction('msg-1', 'user-2', '❤️');
      expect(result.reactions[0].emoji).toBe('❤️');
      expect(result.reactions).toHaveLength(1);
    });
  });
});
