import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserProvider, UserStatus } from '../users/entities/user.entity';

const mockUser: Partial<User> = {
  id: 'uuid-1',
  email: 'test@example.com',
  passwordHash: '$2b$12$hash',
  provider: UserProvider.EMAIL,
  status: UserStatus.ACTIVE,
  refreshTokenHash: null,
};

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
};

const mockConfig = {
  get: jest.fn((key: string, def?: any) => def ?? 'test_value'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue(mockUser);
      mockRepo.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.message).toContain('Registration successful');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', password: 'pass' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user on valid credentials', async () => {
      const hash = await bcrypt.hash('correctpass', 12);
      mockRepo.findOne.mockResolvedValue({ ...mockUser, passwordHash: hash });

      const user = await service.validateUser('test@example.com', 'correctpass');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('correctpass', 12);
      mockRepo.findOne.mockResolvedValue({ ...mockUser, passwordHash: hash });

      await expect(
        service.validateUser('test@example.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('ghost@example.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      mockRepo.update.mockResolvedValue({});
      mockRepo.save.mockResolvedValue(mockUser);

      const tokens = await service.login(mockUser as User);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash', async () => {
      mockRepo.update.mockResolvedValue({});

      await service.logout('uuid-1');

      expect(mockRepo.update).toHaveBeenCalledWith('uuid-1', {
        refreshTokenHash: null,
      });
    });
  });
});
