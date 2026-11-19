import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });
  // Validates every request body against its DTO; unknown fields are rejected,
  // so clients cannot set server-managed fields such as verificationStatus.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend API: http://localhost:${process.env.PORT ?? 3000}`);
}
void bootstrap();
