/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Token, User, UserDetail, UserAddress } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    return await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async getUserById(
    id: string,
  ): Promise<(User & { user_details: UserDetail } & { token: Token }) | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      include: {
        tokens: true,
        user_details: true,
      },
    })) as (User & { user_details: UserDetail } & { token: Token }) | null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    });

    if (!user) {
      throw new NotFoundException();
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

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async createUserDetails(
    userId: string,
    data: Omit<UserDetail, 'id' | 'userId'>,
  ): Promise<UserDetail> {
    return await this.prisma.userDetail.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateUserDetails(
    userId: string,
    data: Partial<UserDetail>,
  ): Promise<UserDetail> {
    return await this.prisma.userDetail.update({
      where: { userId },
      data,
    });
  }

  async createUserAddress(
    userId: string,
    data: Omit<UserAddress, 'id' | 'userId'>,
  ): Promise<UserAddress> {
    return await this.prisma.userAddress.create({
      data: {
        ...data,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateUserAddress(
    userId: string,
    data: Partial<UserAddress>,
  ): Promise<UserAddress> {
    return await this.prisma.userAddress.update({
      where: { userId },
      data,
    });
  }

  async getUserDetailsAndAddress(
    userId: string,
  ): Promise<{ details: UserDetail | null; address: UserAddress | null }> {
    const details = await this.prisma.userDetail.findUnique({
      where: { userId },
    });

    const address = await this.prisma.userAddress.findUnique({
      where: { userId },
    });

    return { details, address };
  }

  async deleteUser(id: string): Promise<User> {
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async getAllUser(): Promise<User[]> {
    return (await this.prisma.user.findMany()) as User[];
  }

  async deleteTokens(userId: string) {
    return await this.prisma.token.delete({
      where: {
        userId,
      },
    });
  }

  async updateToken(userId: string, data: Partial<Token>): Promise<Token> {
    return await this.prisma.token.upsert({
      where: { userId },
      update: {
        token: data.token,
        resetToken: data.resetToken,
        refreshToken: data.refreshToken,
        expires_at: new Date(),
      },
      create: {
        token: data.token,
        resetToken: data.resetToken,
        refreshToken: data.refreshToken,
        expires_at: new Date(),
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async getUserTokens(userId: string): Promise<Token | null> {
    return await this.prisma.token.findFirst({
      where: {
        userId,
      },
    });
  }

  async saveTokens(data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresAt?: Date | undefined;
  }): Promise<Token> {
    return await this.prisma.token.upsert({
      where: {
        userId: data.userId,
      },
      update: {
        userId: data.userId,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expires_at: data.expiresAt ?? new Date(),
      },
      create: {
        userId: data.userId,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        expires_at: data.expiresAt ?? new Date(),
      },
    });
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
