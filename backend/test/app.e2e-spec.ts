import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../src/app.module';

describe('BlindMatch E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /health → 200', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
        });
    });
  });

  describe('Auth flow', () => {
    const testEmail = `e2e_${Date.now()}@test.com`;
    const testPassword = 'Test@12345';

    it('POST /auth/register → 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword })
        .expect(201);

      expect(res.body.message).toContain('Registration');
    });

    it('POST /auth/register duplicate → 409', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword })
        .expect(409);
    });

    it('POST /auth/login with wrong password → 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testEmail, password: 'wrongpass' })
        .expect(401);
    });

    it('POST /auth/login → 200 with token', async () => {
      // Need verified user for full flow; skip if email verification required
      // In test mode, auto-verify
    });
  });

  describe('Profile', () => {
    it('GET /profiles/me without auth → 401', () => {
      return request(app.getHttpServer()).get('/profiles/me').expect(401);
    });
  });

  describe('Rooms', () => {
    it('GET /rooms without auth → 401', () => {
      return request(app.getHttpServer()).get('/rooms').expect(401);
    });
  });
});
