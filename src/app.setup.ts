import { type INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { env } from './config/env';

/** Shared by main.ts and e2e tests so both run the same app configuration. */
export function configureApp(app: INestApplication): void {
  app.use(helmet());
  app.enableCors({
    origin: env.corsOrigins,
    // Lets the browser read the download filename (e.g. merged.pdf) from the response.
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('FoculessPDF API')
    .setDescription('PDF file tools: merge, split, compress, convert and more.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config));
}
