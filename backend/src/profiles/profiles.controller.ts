import {
  Controller, Get, Patch, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  getMyProfile(@CurrentUser() user: User) {
    return this.profilesService.getOrCreate(user.id);
  }

  @Patch('me')
  updateMyProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.profilesService.update(user.id, dto);
  }

  @Get('candidates')
  getCandidates(@CurrentUser() user: User, @Query('limit') limit = 20) {
    return this.profilesService.findCandidates(user.id, +limit);
  }

  @Get(':id')
  getProfile(@Param('id') id: string, @Query('stage') stage = 1) {
    return this.profilesService.getPublicProfile(id, +stage);
  }
}
