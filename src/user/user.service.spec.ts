/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { HttpException, NotFoundException } from '@nestjs/common/exceptions';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { HttpStatus } from '@nestjs/common';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// TODO: Refactor and cleanup the tests because it looks like shit from what i'm seeing XD

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    prismaMock.user.findUnique.mockClear();
    prismaMock.user.findMany.mockClear();
  });

  describe('getUserByUsername', () => {
    it('should return user when searching by username', async () => {
      const existingUser = {
        username: 'testuser',
        email: 'test@example.com',
      };

      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      const result = await userService.getUserByUsername(existingUser.username);
      expect(result).toEqual(existingUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: existingUser.username },
            { email: existingUser.username },
          ],
        },
      });
    });

    it('should return user when searching by email', async () => {
      const existingUser = {
        username: 'testuser',
        email: 'test@example.com',
      };

      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      const result = await userService.getUserByUsername(existingUser.email);
      expect(result).toEqual(existingUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: existingUser.email }, { email: existingUser.email }],
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.getUserByUsername('nonexistent'),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: 'nonexistent' }, { email: 'nonexistent' }],
        },
      });
    });
  });

  describe('getAllUser', () => {
    it('should return all user', async () => {
      const allUser = [
        {
          username: 'user1',
          name: 'User 1',
        },
        {
          username: 'user2',
          name: 'User 2',
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(allUser);

      const result = await userService.getAllUser();
      expect(result).toEqual(allUser);
    });

    it('should return empty array if there are no users', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await userService.getAllUser();
      expect(result).toEqual([]);
    });
  });

  describe('validateCredentials', () => {
    it('should return a user if the credentials are valid', async () => {
      const validUser = {
        username: 'valid-user',
        password: 'hashed-password',
      };

      prismaMock.user.findFirst.mockResolvedValue(validUser);
      jest.spyOn(userService, 'comparePasswords').mockResolvedValue(true);

      const result = await userService.validateCredentials({
        username: validUser.username,
        password: 'plain-password',
      });

      expect(result).toEqual(validUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: validUser.username }, { email: validUser.username }],
        },
      });
      expect(userService.comparePasswords).toHaveBeenCalledWith(
        validUser.password,
        'plain-password',
      );
    });

    it('should throw NotFoundException if the user is not found', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.validateCredentials({
          username: 'non-existing-user',
          password: 'plain-password',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: 'non-existing-user' },
            { email: 'non-existing-user' },
          ],
        },
      });
    });

    it('should throw NotFoundException if the password is invalid', async () => {
      const validUser = {
        username: 'valid-user',
        password: 'hashed-password',
      };

      prismaMock.user.findFirst.mockResolvedValue(validUser);
      jest.spyOn(userService, 'comparePasswords').mockResolvedValue(false);

      await expect(
        userService.validateCredentials({
          username: validUser.username,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(
        new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED),
      );

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: validUser.username }, { email: validUser.username }],
        },
      });
      expect(userService.comparePasswords).toHaveBeenCalledWith(
        validUser.password,
        'wrong-password',
      );
    });
  });
});

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    prismaMock.user.findUnique.mockClear();
    prismaMock.user.findMany.mockClear();
    prismaMock.user.create.mockClear();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'password',
        email: 'testuser@example.com',
        accountNumber: '11111',
        mobile: '12331111',
        accountId: '123',
        cId: '1234',
      };

      const hashedPassword = 'hashed-password';
      // @ts-expect-error invalid type
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(prismaMock.user, 'create').mockResolvedValue({
        ...user,
        password: hashedPassword,
      });

      const result = await userService.createUser(user);
      expect(result).toEqual({
        ...user,
        password: hashedPassword,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    });
  });
});
