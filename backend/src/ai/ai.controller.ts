import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/entities/user.entity';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private profilesService: ProfilesService,
  ) {}

  @Get('daily-question')
  @ApiOperation({ summary: 'Get today\'s profile question' })
  getDailyQuestion() {
    return this.aiService.generateDailyQuestion();
  }

  @Get('icebreakers/:matchId')
  @ApiOperation({ summary: 'Get AI-generated icebreakers for a match' })
  async getIcebreakers(
    @Param('matchId') matchId: string,
    @CurrentUser() user: User,
  ) {
    // Simplified: get user profile and a placeholder for partner
    const myProfile = await this.profilesService.getOrCreate(user.id);
    return this.aiService.generateIcebreakers(myProfile, myProfile);
  }
}
