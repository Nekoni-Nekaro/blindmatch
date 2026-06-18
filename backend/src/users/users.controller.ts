import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Delete('me')
  async deleteAccount(@CurrentUser() user: User) {
    await this.usersService.deactivate(user.id);
    return { message: 'Account scheduled for deletion' };
  }
}
