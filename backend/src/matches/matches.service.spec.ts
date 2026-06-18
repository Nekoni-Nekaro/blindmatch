import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { Like } from './entities/like.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { AiService } from '../ai/ai.service';
import { Profile, RelationshipGoal } from '../profiles/entities/profile.entity';

const mockProfile: Partial<Profile> = {
  id: 'p1',
  userId: 'user-1',
  interestTags: ['gaming'],
  personalityTags: [],
  lifestyleTags: [],
  relationshipGoal: RelationshipGoal.SERIOUS,
};

const mockMatch: Partial<Match> = {
  id: 'match-1',
  user1Id: 'user-1',
  user2Id: 'user-2',
  compatibilityScore: 75,
  revealStage: 1,
  user1WantsReveal: false,
  user2WantsReveal: false,
  isActive: true,
};

const mockMatchRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockLikeRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockProfilesService = {
  getOrCreate: jest.fn().mockResolvedValue(mockProfile),
  scoreCompatibility: jest.fn().mockReturnValue(75),
};

const mockAiService = {
  analyzeCompatibility: jest.fn().mockResolvedValue('Great match!'),
};

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: mockMatchRepo },
        { provide: getRepositoryToken(Like), useValue: mockLikeRepo },
        { provide: ProfilesService, useValue: mockProfilesService },
        { provide: AiService, useValue: mockAiService },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    jest.clearAllMocks();
  });

  describe('like', () => {
    it('should send like when no existing like', async () => {
      mockLikeRepo.findOne.mockResolvedValueOnce(null); // no existing like
      mockLikeRepo.findOne.mockResolvedValueOnce(null); // no mutual like
      mockLikeRepo.create.mockReturnValue({});
      mockLikeRepo.save.mockResolvedValue({});

      const result = await service.like('user-1', 'user-2');
      expect(result.message).toBe('Like sent');
    });

    it('should not duplicate like', async () => {
      mockLikeRepo.findOne.mockResolvedValueOnce({ id: 'existing' });

      const result = await service.like('user-1', 'user-2');
      expect(result.message).toBe('Already liked');
      expect(mockLikeRepo.save).not.toHaveBeenCalled();
    });

    it('should create match on mutual like', async () => {
      mockLikeRepo.findOne.mockResolvedValueOnce(null);      // no existing
      mockLikeRepo.findOne.mockResolvedValueOnce({ id: 'mutual' }); // mutual exists
      mockLikeRepo.create.mockReturnValue({});
      mockLikeRepo.save.mockResolvedValue({});
      mockMatchRepo.create.mockReturnValue(mockMatch);
      mockMatchRepo.save.mockResolvedValue(mockMatch);

      const result = await service.like('user-1', 'user-2');
      expect(result.isNewMatch).toBe(true);
      expect(result.message).toBe("It's a match!");
    });
  });

  describe('getMatch', () => {
    it('should return match if user is participant', async () => {
      mockMatchRepo.findOne.mockResolvedValue(mockMatch);
      const result = await service.getMatch('match-1', 'user-1');
      expect(result.id).toBe('match-1');
    });

    it('should throw NotFoundException if user is not participant', async () => {
      mockMatchRepo.findOne.mockResolvedValue(mockMatch);
      await expect(service.getMatch('match-1', 'stranger')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requestReveal', () => {
    it('should mark user1WantsReveal', async () => {
      mockMatchRepo.findOne.mockResolvedValue({ ...mockMatch });
      mockMatchRepo.save.mockResolvedValue({ ...mockMatch, user1WantsReveal: true });

      const result = await service.requestReveal('match-1', 'user-1');
      expect(mockMatchRepo.save).toHaveBeenCalled();
    });

    it('should advance stage when both users agree', async () => {
      mockMatchRepo.findOne.mockResolvedValue({
        ...mockMatch,
        user1WantsReveal: true,
        user2WantsReveal: false,
      });
      mockMatchRepo.save.mockImplementation((m) => Promise.resolve(m));

      const result = await service.requestReveal('match-1', 'user-2');
      expect(result.revealStage).toBe(2);
    });
  });
});
