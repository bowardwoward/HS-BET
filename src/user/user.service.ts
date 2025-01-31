import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserDetail } from '../entities/user.detail.entity';
import { UserAddress } from '../entities/user.address.entity';
import { Token } from '../entities/token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserDetail)
    private readonly userDetailRepository: Repository<UserDetail>,
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async createUser(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async getUserById(
    id: string,
  ): Promise<(User & { user_details: UserDetail } & { token: Token }) | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['user_details', 'tokens'],
    });
    return user as
      | (User & { user_details: UserDetail } & { token: Token })
      | null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user) {
      throw new NotFoundException();
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const updateData = { ...data };

    if (data.password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      updateData.password = hashedPassword;
    } else {
      delete updateData.password;
    }

    await this.userRepository.update(id, updateData);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUserDetails(
    userId: string,
    data: Omit<UserDetail, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserDetail> {
    const userDetail = this.userDetailRepository.create({
      ...data,
      userId,
    });
    return await this.userDetailRepository.save(userDetail);
  }

  async updateUserDetails(
    userId: string,
    data: Partial<UserDetail>,
  ): Promise<UserDetail> {
    await this.userDetailRepository.update(
      {
        user: {
          id: userId,
        },
      },
      data,
    );
    const userDetail = await this.userDetailRepository.findOneBy({
      user: {
        id: userId,
      },
    });
    if (!userDetail) {
      throw new NotFoundException('UserDetail not found');
    }
    return userDetail;
  }

  async createUserAddress(
    userId: string,
    data: Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserAddress> {
    const userAddress = this.userAddressRepository.create({
      ...data,
      user: {
        id: userId,
      },
    });
    return await this.userAddressRepository.save(userAddress);
  }

  async updateUserAddress(
    userId: string,
    data: Partial<UserAddress>,
  ): Promise<UserAddress> {
    await this.userAddressRepository.update(
      {
        user: {
          id: userId,
        },
      },
      data,
    );

    const userAddress = await this.userAddressRepository.findOneBy({
      user: {
        id: userId,
      },
    });
    if (!userAddress) {
      throw new NotFoundException('UserAddress not found');
    }
    return userAddress;
  }

  async getUserDetailsAndAddress(
    userId: string,
  ): Promise<{ details: UserDetail | null; address: UserAddress | null }> {
    const details = await this.userDetailRepository.findOneBy({
      user: {
        id: userId,
      },
    });
    const address = await this.userAddressRepository.findOneBy({
      user: { id: userId },
    });
    return { details, address };
  }

  async deleteUser(id: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    await this.userRepository.delete(id);
    return user;
  }

  async getAllUser(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async deleteTokens(userId: string) {
    return await this.tokenRepository.delete({
      user: {
        id: userId,
      },
    });
  }

  async updateToken(
    userId: string,
    data: Partial<Token>,
  ): Promise<Token | null> {
    const token = await this.tokenRepository.findOneBy({
      user: {
        id: userId,
      },
    });
    if (token) {
      await this.tokenRepository.update(
        {
          user: {
            id: userId,
          },
        },
        {
          token: data.token,
          resetToken: data.resetToken,
          refreshToken: data.refreshToken,
          expires_at: new Date(),
        },
      );
      return await this.tokenRepository.findOneBy({
        user: {
          id: userId,
        },
      });
    }
    const newToken = this.tokenRepository.create({
      user: {
        id: userId,
      },
      token: data.token,
      resetToken: data.resetToken,
      refreshToken: data.refreshToken,
      expires_at: new Date(),
    });
    return await this.tokenRepository.save(newToken);
  }

  async getUserTokens(userId: string): Promise<Token | null> {
    return await this.tokenRepository.findOneBy({
      user: {
        id: userId,
      },
    });
  }

  async saveTokens(data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt?: Date | undefined;
  }): Promise<Token | null> {
    const token = await this.tokenRepository.findOneBy({
      user: {
        id: data.userId,
      },
    });
    if (token) {
      await this.tokenRepository.update(
        {
          user: {
            id: data.userId,
          },
        },
        {
          token: data.accessToken,
          refreshToken: data.refreshToken,
          expires_at: data.expiresAt ?? new Date(),
        },
      );
      return await this.tokenRepository.findOneBy({
        user: { id: data.userId },
      });
    }
    const newToken = this.tokenRepository.create({
      user: {
        id: data.userId,
      },
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expires_at: data.expiresAt ?? new Date(),
    });
    return await this.tokenRepository.save(newToken);
  }

  async comparePasswords(
    incomingPassword: string,
    existingPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(existingPassword, incomingPassword);
  }

  async validateCredentials(data: Pick<User, 'username' | 'password'>) {
    const user = await this.getUserByUsername(data.username);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const match = await this.comparePasswords(user.password, data.password);

    if (!match) {
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
