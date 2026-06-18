import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['profile'] });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email }, relations: ['profile'] });
  }

  async updateLastActive(id: string) {
    await this.repo.update(id, { lastActiveAt: new Date() });
  }

  async deactivate(id: string) {
    await this.repo.update(id, { status: UserStatus.DELETED });
  }

  async updateTrustScore(id: string, delta: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return;
    user.trustScore = Math.max(0, Math.min(100, user.trustScore + delta));
    return this.repo.save(user);
  }
}
