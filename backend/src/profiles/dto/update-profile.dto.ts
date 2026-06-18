import {
  IsString, IsOptional, IsArray, IsEnum, IsNumber, MaxLength,
  ArrayMaxSize, Min, Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RelationshipGoal, PersonalityType, GenderIdentity, FamilyValues } from '../entities/profile.entity';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  questionOfDayAnswer?: string;

  @ApiPropertyOptional({ enum: RelationshipGoal })
  @IsOptional()
  @IsEnum(RelationshipGoal)
  relationshipGoal?: RelationshipGoal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(100)
  interestTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  personalityTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  lifestyleTags?: string[];

  @ApiPropertyOptional({ enum: PersonalityType })
  @IsOptional()
  @IsEnum(PersonalityType)
  personalityType?: PersonalityType;

  @ApiPropertyOptional({ enum: GenderIdentity })
  @IsOptional()
  @IsEnum(GenderIdentity)
  genderIdentity?: GenderIdentity;

  @ApiPropertyOptional({ enum: FamilyValues })
  @IsOptional()
  @IsEnum(FamilyValues)
  familyValues?: FamilyValues;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(99)
  ageRangeMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(18)
  @Max(99)
  ageRangeMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Max(500)
  maxDistanceKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  musicPreferences?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteGames?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteMovies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteBooks?: string[];
}
