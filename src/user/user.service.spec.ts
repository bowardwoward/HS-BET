/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { HttpException, NotFoundException } from '@nestjs/common/exceptions';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
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
    it('should return user if exists', async () => {
      const existingUser = {
        username: 'existing-user',
        name: 'Existing User',
      };

      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      const result = await userService.getUserByUsername(existingUser.username);
      expect(result).toEqual(existingUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: existingUser.username },
      });
    });

    it('should throw NotFoundException if user not exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.getUserByUsername('non-existing-user'),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'non-existing-user' },
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

      prismaMock.user.findUnique.mockResolvedValue(validUser);
      jest.spyOn(userService, 'comparePasswords').mockResolvedValue(true);

      const result = await userService.validateCredentials({
        username: validUser.username,
        password: 'plain-password',
      });

      expect(result).toEqual(validUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: validUser.username },
      });
      expect(userService.comparePasswords).toHaveBeenCalledTimes(1);
      expect(userService.comparePasswords).toHaveBeenCalledWith(
        validUser.password,
        'plain-password',
      );
    });

    it('should throw HttpException if the user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.validateCredentials({
          username: 'non-existing-user',
          password: 'plain-password',
        }),
      ).rejects.toThrow(HttpException);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'non-existing-user' },
      });
    });

    it('should throw HttpException if the password is invalid', async () => {
      const validUser = {
        username: 'valid-user',
        password: 'hashed-password',
      };

      prismaMock.user.findUnique.mockResolvedValue(validUser);
      jest.spyOn(userService, 'comparePasswords').mockResolvedValue(false);

      await expect(
        userService.validateCredentials({
          username: validUser.username,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(HttpException);
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: validUser.username },
      });
      expect(userService.comparePasswords).toHaveBeenCalledTimes(1);
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
