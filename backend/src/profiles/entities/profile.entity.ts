import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RelationshipGoal {
  SERIOUS = 'serious',
  CASUAL = 'casual',
  FRIENDSHIP = 'friendship',
  NETWORKING = 'networking',
  NOT_SURE = 'not_sure',
}

export enum PersonalityType {
  INTJ = 'INTJ', INTP = 'INTP', ENTJ = 'ENTJ', ENTP = 'ENTP',
  INFJ = 'INFJ', INFP = 'INFP', ENFJ = 'ENFJ', ENFP = 'ENFP',
  ISTJ = 'ISTJ', ISFJ = 'ISFJ', ESTJ = 'ESTJ', ESFJ = 'ESFJ',
  ISTP = 'ISTP', ISFP = 'ISFP', ESTP = 'ESTP', ESFP = 'ESFP',
}

export enum GenderIdentity {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum FamilyValues {
  WANT_KIDS = 'want_kids',
  DONT_WANT_KIDS = 'dont_want_kids',
  OPEN = 'open',
  HAVE_KIDS = 'have_kids',
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  // Visible at all stages
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  questionOfDayAnswer: string;

  @Column({ type: 'enum', enum: RelationshipGoal, nullable: true })
  relationshipGoal: RelationshipGoal;

  @Column({ type: 'jsonb', default: [] })
  interestTags: string[]; // up to 100

  @Column({ type: 'jsonb', default: [] })
  personalityTags: string[]; // up to 50

  @Column({ type: 'jsonb', default: [] })
  lifestyleTags: string[]; // up to 50

  @Column({ type: 'text', nullable: true })
  voiceIntroUrl: string;

  // Visible after mutual match (stage 2)
  @Column({ nullable: true })
  ageRangeMin: number; // age range instead of exact DOB

  @Column({ nullable: true })
  ageRangeMax: number;

  @Column({ nullable: true })
  region: string;

  // Visible after stage 3 (unlocked by user)
  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  photoUrls: string; // JSON array of photo URLs

  @Column({ nullable: true })
  displayName: string; // first name or chosen name

  // Personality & values (always visible, not personally identifying)
  @Column({ type: 'enum', enum: PersonalityType, nullable: true })
  personalityType: PersonalityType;

  @Column({ type: 'enum', enum: GenderIdentity, nullable: true })
  genderIdentity: GenderIdentity;

  @Column({ nullable: true })
  lookingForGender: string; // JSON array

  @Column({ type: 'enum', enum: FamilyValues, nullable: true })
  familyValues: FamilyValues;

  @Column({ type: 'jsonb', nullable: true })
  musicPreferences: string[];

  @Column({ type: 'jsonb', nullable: true })
  favoriteGames: string[];

  @Column({ type: 'jsonb', nullable: true })
  favoriteMovies: string[];

  @Column({ type: 'jsonb', nullable: true })
  favoriteBooks: string[];

  @Column({ nullable: true })
  politicalViews: string; // optional, user controlled

  // For matching algorithm
  @Column({ nullable: true })
  locationLat: number;

  @Column({ nullable: true })
  locationLng: number;

  @Column({ nullable: true })
  maxDistanceKm: number;

  @Column({ default: false })
  isComplete: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  profileViews: number;

  @Column({ default: 0 })
  likesReceived: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
