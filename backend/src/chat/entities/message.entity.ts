import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  GIF = 'gif',
  STICKER = 'sticker',
  SYSTEM = 'system',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Match, (m) => m.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @Column()
  @Index()
  matchId: string;

  @ManyToOne(() => User, (u) => u.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'jsonb', nullable: true })
  reactions: { userId: string; emoji: string }[];

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  readAt: Date;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
