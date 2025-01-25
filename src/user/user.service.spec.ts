import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions';

const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

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
});
