import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  dbName: process.env.DB_NAME || 'mediworld_db',
  
  // Entity discovery
  entities: ['./dist/src/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  
  // Migrations
  migrations: {
    tableName: 'mikro_orm_migrations',
    path: './dist/src/db/mikro-migrations',
    pathTs: './src/db/mikro-migrations',
    transactional: true,
    allOrNothing: true,
    emit: 'ts',
  },
  
  // Development settings
  debug: process.env.NODE_ENV === 'dev',
  
  // Extensions
  extensions: [Migrator],
  
  // Schema management
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },
});
