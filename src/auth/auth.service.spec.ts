/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
          },
        },
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            validateCredentials: jest.fn(),
            saveTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('jwtService should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should sign in and return an access token', async () => {
    const credentials = {
      username: 'test',
      password: 'testpassword',
    };
    const hashedToken = 'hashedToken';

    (userService.validateCredentials as jest.Mock).mockResolvedValueOnce(
      credentials,
    );

    (jwtService.signAsync as jest.Mock).mockResolvedValueOnce('token');

    jest.spyOn(service, 'hashData').mockResolvedValue(hashedToken);
    const response = await service.login(
      credentials.username || 'test',
      credentials.password || 'test',
    );

    expect(response).toEqual({
      accessToken: 'token',
      refreshToken: hashedToken,
    });
  });
  it('should generate tokens, hash the refresh token, and save them', async () => {
    const userId = 'userId';
    const username = 'username';
    const hashedToken = 'hashedToken';

    (jwtService.signAsync as jest.Mock).mockResolvedValue('token');
    (userService.saveTokens as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(service, 'hashData').mockResolvedValue(hashedToken);

    const tokens = await service.getTokens(userId, username);

    expect(tokens).toEqual({ accessToken: 'token', refreshToken: hashedToken });
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(userService.saveTokens).toHaveBeenCalledWith({
      userId,
      accessToken: 'token',
      refreshToken: hashedToken,
      expiresAt: expect.any(Date),
    });
    expect(service.hashData).toHaveBeenCalledWith('token');
  });

  it('should throw an UnauthorizedException if the user cannot log in', async () => {
    (userService.validateCredentials as jest.Mock).mockResolvedValueOnce(null);

    await expect(service.login('testuser', 'invalid-password')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
