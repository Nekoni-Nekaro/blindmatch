import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile, RelationshipGoal } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';

const mockProfile: Partial<Profile> = {
  id: 'profile-1',
  userId: 'user-1',
  description: 'Test bio',
  relationshipGoal: RelationshipGoal.SERIOUS,
  interestTags: ['gaming', 'music', 'travel'],
  personalityTags: ['curious', 'creative'],
  lifestyleTags: ['night_owl'],
  isComplete: true,
  isActive: true,
};

const mockProfileRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
};

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    jest.clearAllMocks();
  });

  describe('getOrCreate', () => {
    it('should return existing profile', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockProfile);

      const result = await service.getOrCreate('user-1');
      expect(result).toEqual(mockProfile);
      expect(mockProfileRepo.save).not.toHaveBeenCalled();
    });

    it('should create profile if not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      mockProfileRepo.create.mockReturnValue({ userId: 'user-1' });
      mockProfileRepo.save.mockResolvedValue({ userId: 'user-1' });

      const result = await service.getOrCreate('user-1');
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return profile by id', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockProfile);
      const result = await service.getById('profile-1');
      expect(result.id).toBe('profile-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      await expect(service.getById('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('scoreCompatibility', () => {
    it('should return 100 for identical profiles', () => {
      const p = mockProfile as Profile;
      const score = service.scoreCompatibility(p, p);
      expect(score).toBe(100);
    });

    it('should return 0 for completely different profiles', () => {
      const p1 = { ...mockProfile, interestTags: ['a'], personalityTags: ['x'], lifestyleTags: ['1'], relationshipGoal: RelationshipGoal.SERIOUS } as Profile;
      const p2 = { ...mockProfile, interestTags: ['b'], personalityTags: ['y'], lifestyleTags: ['2'], relationshipGoal: RelationshipGoal.CASUAL } as Profile;
      const score = service.scoreCompatibility(p1, p2);
      expect(score).toBe(0);
    });

    it('should return partial score for partial overlap', () => {
      const p1 = { ...mockProfile, interestTags: ['gaming', 'music'], personalityTags: [], lifestyleTags: [], relationshipGoal: RelationshipGoal.SERIOUS } as Profile;
      const p2 = { ...mockProfile, interestTags: ['gaming', 'travel'], personalityTags: [], lifestyleTags: [], relationshipGoal: RelationshipGoal.SERIOUS } as Profile;
      const score = service.scoreCompatibility(p1, p2);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe('filterByStage', () => {
    it('stage 1 should not include photo or displayName', () => {
      const result = service.filterByStage(mockProfile as Profile, 1);
      expect(result).not.toHaveProperty('photoUrl');
      expect(result).not.toHaveProperty('displayName');
    });

    it('stage 3 should include displayName and photoUrl', () => {
      const profileWithPhoto = { ...mockProfile, displayName: 'Alex', photoUrl: 'https://example.com/photo.jpg' } as Profile;
      const result = service.filterByStage(profileWithPhoto, 3);
      expect(result).toHaveProperty('displayName', 'Alex');
      expect(result).toHaveProperty('photoUrl');
    });
  });
});
