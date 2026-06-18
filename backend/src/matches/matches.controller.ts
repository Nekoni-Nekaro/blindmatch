import {
  Controller, Get, Post, Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MatchesService } from './matches.service';
import { User } from '../users/entities/user.entity';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all my matches' })
  getMyMatches(@CurrentUser() user: User) {
    return this.matchesService.getMyMatches(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single match by ID' })
  getMatch(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.getMatch(id, user.id);
  }

  @Post(':profileId/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a profile' })
  like(@Param('profileId') profileId: string, @CurrentUser() user: User) {
    return this.matchesService.like(user.id, profileId);
  }

  @Post(':profileId/pass')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pass on a profile' })
  pass(@Param('profileId') profileId: string, @CurrentUser() user: User) {
    return this.matchesService.pass(user.id, profileId);
  }

  @Post(':id/reveal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request next reveal stage for a match' })
  requestReveal(@Param('id') id: string, @CurrentUser() user: User) {
    return this.matchesService.requestReveal(id, user.id);
  }
}
