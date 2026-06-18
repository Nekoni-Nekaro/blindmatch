import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserProvider, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash,
      provider: UserProvider.EMAIL,
      status: UserStatus.PENDING,
      emailVerificationToken: uuidv4(),
    });
    await this.usersRepo.save(user);
    // TODO: send verification email
    return { message: 'Registration successful. Please verify your email.' };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    if (user.status === UserStatus.SUSPENDED) throw new UnauthorizedException('Account suspended');
    return user;
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    user.lastActiveAt = new Date();
    await this.usersRepo.save(user);
    return tokens;
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
  }

  async validateGoogleUser(googleUser: {
    email: string; providerId: string; displayName?: string;
  }): Promise<User> {
    let user = await this.usersRepo.findOne({
      where: [{ email: googleUser.email }, { providerId: googleUser.providerId }],
    });
    if (!user) {
      user = this.usersRepo.create({
        email: googleUser.email,
        provider: UserProvider.GOOGLE,
        providerId: googleUser.providerId,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      });
      await this.usersRepo.save(user);
    }
    return user;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(userId, { refreshTokenHash: hash });
  }
}
