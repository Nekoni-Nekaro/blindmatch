import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('likes')
@Unique(['fromUserId', 'toUserId'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.sentLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @Column()
  @Index()
  fromUserId: string;

  @ManyToOne(() => User, (u) => u.receivedLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column()
  @Index()
  toUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
