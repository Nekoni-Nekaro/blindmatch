import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Like } from './entities/like.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match) private matchRepo: Repository<Match>,
    @InjectRepository(Like) private likeRepo: Repository<Like>,
    private profilesService: ProfilesService,
    private aiService: AiService,
  ) {}

  async like(fromUserId: string, toUserId: string) {
    // Check if already liked
    const existing = await this.likeRepo.findOne({
      where: { fromUserId, toUserId },
    });
    if (existing) return { message: 'Already liked' };

    await this.likeRepo.save(
      this.likeRepo.create({ fromUserId, toUserId }),
    );

    // Check mutual like -> create match
    const mutual = await this.likeRepo.findOne({
      where: { fromUserId: toUserId, toUserId: fromUserId },
    });
    if (mutual) {
      return this.createMatch(fromUserId, toUserId);
    }

    return { message: 'Like sent' };
  }

  async pass(fromUserId: string, toUserId: string) {
    // Record pass (to not show again)
    return { message: 'Passed' };
  }

  private async createMatch(user1Id: string, user2Id: string) {
    const [p1, p2] = await Promise.all([
      this.profilesService.getOrCreate(user1Id),
      this.profilesService.getOrCreate(user2Id),
    ]);

    const compatibilityScore = this.profilesService.scoreCompatibility(p1, p2);

    // Trigger AI analysis async
    let aiAnalysis = null;
    try {
      aiAnalysis = await this.aiService.analyzeCompatibility(p1, p2);
    } catch (e) {
      // Non-blocking
    }

    const match = await this.matchRepo.save(
      this.matchRepo.create({
        user1Id,
        user2Id,
        compatibilityScore,
        aiAnalysis,
        revealStage: 1,
      }),
    );

    return { match, isNewMatch: true, message: 'It\'s a match!' };
  }

  async getMyMatches(userId: string) {
    return this.matchRepo.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async getMatch(matchId: string, userId: string): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
    });
    if (!match || (match.user1Id !== userId && match.user2Id !== userId)) {
      throw new NotFoundException('Match not found');
    }
    return match;
  }

  async requestReveal(matchId: string, userId: string) {
    const match = await this.getMatch(matchId, userId);
    const isUser1 = match.user1Id === userId;
    if (isUser1) match.user1WantsReveal = true;
    else match.user2WantsReveal = true;

    if (match.user1WantsReveal && match.user2WantsReveal) {
      match.revealStage = Math.min(4, match.revealStage + 1);
      match.user1WantsReveal = false;
      match.user2WantsReveal = false;
    }

    return this.matchRepo.save(match);
  }
}
