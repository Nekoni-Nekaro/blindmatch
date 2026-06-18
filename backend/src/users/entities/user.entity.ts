import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, OneToMany, Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Profile } from '../../profiles/entities/profile.entity';
import { Like } from '../../matches/entities/like.entity';
import { Match } from '../../matches/entities/match.entity';
import { Message } from '../../chat/entities/message.entity';

export enum UserProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  DISCORD = 'discord',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  PENDING = 'pending',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ nullable: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserProvider, default: UserProvider.EMAIL })
  provider: UserProvider;

  @Column({ nullable: true })
  providerId: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'int', default: 1 })
  visibilityLevel: number; // 1-4 stages of reveal

  @Column({ type: 'float', default: 0 })
  trustScore: number;

  @Column({ nullable: true })
  @Exclude()
  refreshTokenHash: string;

  @Column({ nullable: true })
  lastActiveAt: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Like, (like) => like.fromUser)
  sentLikes: Like[];

  @OneToMany(() => Like, (like) => like.toUser)
  receivedLikes: Like[];

  @OneToMany(() => Match, (match) => match.user1)
  matches1: Match[];

  @OneToMany(() => Match, (match) => match.user2)
  matches2: Match[];

  @OneToMany(() => Message, (msg) => msg.sender)
  messages: Message[];
}
