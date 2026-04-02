import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { TenantsService } from './tenants/tenants.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global prefixes and pipes
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true, 
    forbidNonWhitelisted: true 
  }));

  // Tenant Middleware
  app.use(async (req, res, next) => {
    const host = req.headers.host || '';
    const subdomain = host.split('.')[0];
    if (subdomain === 'localhost' || subdomain === '127' || subdomain === 'api') {
      req['tenantId'] = null; // superadmin
      return next();
    }
    const tenantsService = app.get(TenantsService);
    const tenant = await tenantsService.findBySubdomain(subdomain);
    if (!tenant) {
      return res.status(401).json({ error: 'Invalid tenant' });
    }
    req['tenantId'] = tenant.id;
    next();
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('LMS SaaS API')
    .setDescription('Multi-tenant LMS Backend')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Multi-tenant LMS Backend on http://localhost:${port}/api`);
  logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();

