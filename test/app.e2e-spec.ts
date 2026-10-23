import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

const pdfFile = { contentType: 'application/pdf' };

async function pdfWithPages(count: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < count; i++) doc.addPage();
  return Buffer.from(await doc.save());
}

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

  it('POST /api/v1/merge returns the merged PDF', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/merge')
      .attach('files', await pdfWithPages(1), { ...pdfFile, filename: 'a.pdf' })
      .attach('files', await pdfWithPages(1), { ...pdfFile, filename: 'b.pdf' })
      .responseType('blob')
      .expect(200)
      .expect('Content-Type', 'application/pdf')
      .expect('Content-Disposition', 'attachment; filename="merged.pdf"');

    expect((await PDFDocument.load(res.body)).getPageCount()).toBe(2);
  });

  it('POST /api/v1/split returns a ZIP with one PDF per range', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/split')
      .attach('file', await pdfWithPages(3), { ...pdfFile, filename: 'a.pdf' })
      .field('ranges', '1-2,3')
      .responseType('blob')
      .expect(200)
      .expect('Content-Type', 'application/zip')
      .expect('Content-Disposition', 'attachment; filename="split.zip"');

    expect(Object.keys(unzipSync(res.body))).toEqual([
      'part-1_pages-1-2.pdf',
      'part-2_pages-3.pdf',
    ]);
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
