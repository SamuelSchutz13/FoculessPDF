import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(200).expect({ status: 'ok' });
  });

  it('GET /docs-json exposes the OpenAPI document', async () => {
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);
    expect(Object.keys(res.body.paths)).toContain('/api/v1/merge');
  });

  it('POST /api/v1/compress without a file returns 422', () => {
    return request(app.getHttpServer()).post('/api/v1/compress').expect(422);
  });

  it('POST /api/v1/compress rejects a non-PDF file', () => {
    return request(app.getHttpServer())
      .post('/api/v1/compress')
      .attach('file', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(422);
  });

  it('POST /api/v1/split validates the ranges field', () => {
    return request(app.getHttpServer())
      .post('/api/v1/split')
      .attach('file', Buffer.from('%PDF-1.7\n%%EOF'), {
        filename: 'a.pdf',
        contentType: 'application/pdf',
      })
      .field('ranges', 'abc')
      .expect(400);
  });
});
