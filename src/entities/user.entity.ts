import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Token } from './token.entity';
import { UserDetail } from './user.detail.entity';
import { UserAddress } from './user.address.entity';
import { TransferToken } from './transfer-token.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountNumber: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  cId: string;

  @Column()
  mobile: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Token, (token) => token.user)
  tokens: Token;

  @OneToOne(() => UserDetail, (userDetail) => userDetail.user)
  user_details: UserDetail;

  @OneToOne(() => UserAddress, (userAddress) => userAddress.user)
  user_address: UserAddress;

  @OneToMany(() => TransferToken, (transferToken) => transferToken.user)
  TransferToken: TransferToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  // Trim username and email before saving to database
  @BeforeInsert()
  @BeforeUpdate()
  trimFields() {
    this.username = this.username.trim();
    this.email = this.email.trim();
  }

  // Hash password before saving to database
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
