import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class TransferToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  otp: string;

  @Column()
  hashedOtp: string;

  @Column()
  sourceAccountNumber: string;

  @Column()
  destinationAccountNumber: string;

  @Column()
  amount: string;

  @Column({ default: 'Transfer' })
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @ManyToOne(() => User, (user) => user.TransferToken)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
