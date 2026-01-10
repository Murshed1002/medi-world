import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { runMigrations } from './db/migrate';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function bootstrap() {
  if (process.env.RUN_MIGRATIONS === 'true') {
    console.log('🔄 Running database migrations...');
    try {
      await runMigrations();
      console.log('✅ Migrations completed');
      console.log('🔄 Syncing Prisma schema...');
      await execAsync('npx prisma db pull');
      await execAsync('npx prisma generate');
      console.log('✅ Prisma schema synced');
    } catch (error) {
      console.error('❌ Migration or sync failed:', error);
      process.exit(1);
    }
  } 

  const app = await NestFactory.create(AppModule);
  
  await app.listen(process.env.APP_PORT ?? process.env.PORT ?? 8080);
  console.log(`🚀 Application is running on: http://localhost:${process.env.APP_PORT ?? process.env.PORT ?? 8080}`);
}

bootstrap();
