import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { MikroORM } from '@mikro-orm/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Always run migrations on startup
  console.log('🚀 Running migrations...');
  try {
    const orm = app.get(MikroORM);
    const migrator = orm.migrator;
    
    const pending = await migrator.getPendingMigrations();
    
    if (pending.length > 0) {
      console.log(`🔄 Running ${pending.length} pending migration(s)...`);
      await migrator.up();
      console.log('✅ Migrations completed');
    } else {
      console.log('✅ Database is up to date');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  // Enable cookie parser
  app.use(cookieParser());
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for client app
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  await app.listen(process.env.APP_PORT ?? process.env.PORT ?? 8080);
  console.log(`🚀 Application is running on: http://localhost:${process.env.APP_PORT ?? process.env.PORT ?? 8080}`);
}

bootstrap();
