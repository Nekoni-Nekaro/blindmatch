import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { Profile } from './entities/profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  providers: [ProfilesService],
  controllers: [ProfilesController],
  exports: [ProfilesService],
})
export class ProfilesModule {}
