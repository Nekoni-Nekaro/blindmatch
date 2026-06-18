import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';
import { Like } from './entities/like.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Like]), ProfilesModule, AiModule],
  providers: [MatchesService],
  controllers: [MatchesController],
  exports: [MatchesService],
})
export class MatchesModule {}
