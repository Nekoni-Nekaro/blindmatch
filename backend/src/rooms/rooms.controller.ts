import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List all interest rooms' })
  getRooms(@Query('topic') topic?: string, @Query('search') search?: string) {
    return this.roomsService.findAll(topic, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room details' })
  getRoom(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an interest room' })
  joinRoom(@Param('id') id: string) {
    return this.roomsService.join(id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave an interest room' })
  leaveRoom(@Param('id') id: string) {
    return this.roomsService.leave(id);
  }
}
