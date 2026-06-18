import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getOrCreate(userId: string): Promise<Profile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({ userId });
      await this.profileRepo.save(profile);
    }
    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.getOrCreate(userId);
    Object.assign(profile, dto);
    profile.isComplete = this.checkComplete(profile);
    return this.profileRepo.save(profile);
  }

  async getById(profileId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getPublicProfile(profileId: string, viewerStage: number): Promise<Partial<Profile>> {
    const profile = await this.getById(profileId);
    return this.filterByStage(profile, viewerStage);
  }

  // Filter what's visible based on reveal stage
  filterByStage(profile: Profile, stage: number): Partial<Profile> {
    const base = {
      id: profile.id,
      description: profile.description,
      questionOfDayAnswer: profile.questionOfDayAnswer,
      relationshipGoal: profile.relationshipGoal,
      interestTags: profile.interestTags,
      personalityTags: profile.personalityTags,
      lifestyleTags: profile.lifestyleTags,
      personalityType: profile.personalityType,
      familyValues: profile.familyValues,
      musicPreferences: profile.musicPreferences,
      voiceIntroUrl: profile.voiceIntroUrl,
    };

    if (stage >= 2) {
      Object.assign(base, {
        ageRangeMin: profile.ageRangeMin,
        ageRangeMax: profile.ageRangeMax,
        region: profile.region,
      });
    }

    if (stage >= 3) {
      Object.assign(base, {
        displayName: profile.displayName,
        photoUrl: profile.photoUrl,
      });
    }

    if (stage >= 4) {
      Object.assign(base, {
        photoUrls: profile.photoUrls,
        genderIdentity: profile.genderIdentity,
      });
    }

    return base;
  }

  // Core matching: find candidates for a user
  async findCandidates(userId: string, limit = 20): Promise<Profile[]> {
    const myProfile = await this.getOrCreate(userId);

    // Exclude self and already seen
    const candidates = await this.profileRepo
      .createQueryBuilder('p')
      .where('p.userId != :userId', { userId })
      .andWhere('p.isActive = true')
      .andWhere('p.isComplete = true')
      .orderBy('RANDOM()')
      .limit(limit * 3)
      .getMany();

    // Score and sort
    return candidates
      .map((c) => ({ profile: c, score: this.scoreCompatibility(myProfile, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.profile);
  }

  // Tag-based compatibility score 0-100
  scoreCompatibility(a: Profile, b: Profile): number {
    const tagIntersect = (tagsA: string[], tagsB: string[]) => {
      if (!tagsA?.length || !tagsB?.length) return 0;
      const setB = new Set(tagsB);
      const common = tagsA.filter((t) => setB.has(t)).length;
      return common / Math.max(tagsA.length, tagsB.length);
    };

    const interestScore = tagIntersect(a.interestTags, b.interestTags) * 40;
    const personalityScore = tagIntersect(a.personalityTags, b.personalityTags) * 30;
    const lifestyleScore = tagIntersect(a.lifestyleTags, b.lifestyleTags) * 20;
    const goalScore = a.relationshipGoal === b.relationshipGoal ? 10 : 0;

    return Math.round(interestScore + personalityScore + lifestyleScore + goalScore);
  }

  private checkComplete(p: Profile): boolean {
    return !!(
      p.description &&
      p.relationshipGoal &&
      p.interestTags?.length >= 3
    );
  }
}
