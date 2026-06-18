import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../chat/entities/message.entity';

@Entity('matches')
@Unique(['user1Id', 'user2Id'])
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.matches1, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @Column()
  @Index()
  user1Id: string;

  @ManyToOne(() => User, (u) => u.matches2, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @Column()
  @Index()
  user2Id: string;

  @Column({ type: 'float', default: 0 })
  compatibilityScore: number; // 0-100

  @Column({ type: 'jsonb', nullable: true })
  compatibilityBreakdown: {
    interests: number;
    values: number;
    lifestyle: number;
    goals: number;
    personality: number;
  };

  @Column({ nullable: true, type: 'text' })
  aiAnalysis: string; // AI explanation of compatibility

  @Column({ default: 1 })
  revealStage: number; // 1-4

  @Column({ default: false })
  user1WantsReveal: boolean;

  @Column({ default: false })
  user2WantsReveal: boolean;

  @Column({ default: 0 })
  messageCount: number;

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Message, (msg) => msg.match)
  messages: Message[];
}
