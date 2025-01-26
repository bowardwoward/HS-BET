import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { App } from 'supertest/types';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  const authService = { login: jest.fn() };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) should return 401 if now data is passed', () => {
    return request(app.getHttpServer()).post('/auth/login').expect(401);
  });

  it('/api/auth/login (POST) should return 201 if credentials are correct', async () => {
    const loginDto = { username: 'testuser', password: 'testpass' };
    authService.login.mockResolvedValue({
      accessToken: 'testtoken',
      refreshToken: 'testtoken',
    });
    return await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginDto)
      .expect(201)
      .then((res) => {
        console.log('res: ', res);
        // expect(res.body._id).toBeDefined();
        expect(res.status).toBe(201);
      });
  });
});
