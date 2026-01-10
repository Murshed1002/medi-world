# Prisma Setup Guide - Medi-World Backend

## 📚 Complete Guide: Local vs Production Environments

---

## 🏗️ Architecture Overview

### What is Prisma?
- **ORM (Object-Relational Mapping)**: Type-safe database access for TypeScript/Node.js
- **Components**:
  - `prisma`: CLI tool for migrations, introspection (dev dependency)
  - `@prisma/client`: Runtime library for database queries (production dependency)
  - `schema.prisma`: Single source of truth for your database schema

### Generated Files
```
medi-service/
├── prisma/
│   ├── schema.prisma          # Your database schema (version controlled)
│   └── migrations/            # Migration history (version controlled)
│       └── 20240110_init/
│           └── migration.sql
├── node_modules/
│   └── .prisma/client/        # Generated client (NOT version controlled)
└── prisma.config.ts           # Prisma configuration (version controlled)
```

---

## 🚀 Step-by-Step Setup

### 1️⃣ Installation (DONE ✅)

```bash
# Install Prisma CLI (dev dependency)
pnpm add -D prisma

# Install Prisma Client (runtime dependency)
pnpm add @prisma/client
```

### 2️⃣ Initialize Prisma (DONE ✅)

```bash
pnpm exec prisma init --datasource-provider postgresql
```

**This creates:**
- `prisma/schema.prisma` - Database schema definition
- `prisma.config.ts` - Prisma configuration
- Updates `.env` with `DATABASE_URL`

### 3️⃣ Pull Existing Schema (DONE ✅)

```bash
pnpm exec prisma db pull
```

**What this does:**
- Connects to your existing database
- Introspects all tables, columns, relationships
- Generates Prisma models in `schema.prisma`

### 4️⃣ Generate Prisma Client (DONE ✅)

```bash
pnpm exec prisma generate
```

**What this does:**
- Reads `schema.prisma`
- Generates TypeScript client at `node_modules/.prisma/client/`
- Creates type-safe database access methods

---

## 🔄 Development Workflow

### Local Development

#### Starting Fresh
```bash
# 1. Set up environment
cp .env.local .env

# 2. Start database (if using Docker)
docker compose up -d postgres

# 3. Generate Prisma Client
pnpm prisma:generate

# 4. Start development server
pnpm start:dev
```

#### Making Schema Changes

**Method A: Prisma Migrate (Recommended)**
```bash
# 1. Edit prisma/schema.prisma
# Add/modify models

# 2. Create and apply migration
pnpm db:migrate:dev --name add_user_table

# 3. This will:
#    - Generate SQL migration file
#    - Apply it to your database
#    - Regenerate Prisma Client
```

**Method B: Prototyping with db push**
```bash
# Quick iteration without migration history
pnpm prisma:push

# ⚠️ Use only for prototyping!
# This doesn't create migration files
```

#### Syncing with Existing Database
```bash
# If database was changed outside Prisma
pnpm prisma:pull

# Then regenerate client
pnpm prisma:generate
```

---

## 🌍 Environment Configuration

### Local Development (.env.local → .env)
```env
DATABASE_URL=postgresql://root:root@localhost:5432/mediworld_db
NODE_ENV=development
LOG_LEVEL=debug
```

**Characteristics:**
- ✅ Direct database connection
- ✅ Detailed logging
- ✅ Hot reload enabled
- ✅ Connection pooling: default (unlimited)

### Staging (.env.staging.template)
```env
DATABASE_URL=postgresql://staging_user:pwd@staging-db.internal:5432/mediworld_staging
NODE_ENV=staging
LOG_LEVEL=debug
```

**Characteristics:**
- ✅ Similar to production but isolated
- ✅ Test migrations before production
- ✅ Debug logging still enabled

### Production (.env.production.template)
```env
DATABASE_URL=postgresql://prod_user:secure_pwd@prod-db.amazonaws.com:5432/mediworld_prod?connection_limit=10&pool_timeout=20
NODE_ENV=production
LOG_LEVEL=info
```

**Characteristics:**
- ⚡ Connection pooling (limit: 10)
- ⚡ Minimal logging (errors only)
- ⚡ No hot reload
- 🔒 Secure credentials (from secrets manager)

---

## 🚢 Production Deployment

### Pre-Deployment Checklist

1. **Environment Variables**
   ```bash
   # Set in your hosting platform (Heroku, AWS, Railway, etc.)
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   ```

2. **Build Process**
   ```bash
   # This runs automatically in CI/CD
   pnpm install --frozen-lockfile
   pnpm build  # Includes: prisma generate → nest build
   ```

3. **Database Migrations**
   ```bash
   # Run before starting the app
   pnpm db:migrate:deploy
   ```

### Deployment Methods

#### Method 1: Platform-Managed (Recommended)
```yaml
# Example: Railway/Render config
buildCommand: pnpm install && pnpm build
startCommand: pnpm db:migrate:deploy && pnpm start:prod
```

#### Method 2: Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma Client
RUN pnpm prisma:generate

# Build
RUN pnpm build

# Run migrations and start
CMD ["sh", "-c", "pnpm db:migrate:deploy && pnpm start:prod"]
```

#### Method 3: Manual
```bash
# On your server
git pull origin main
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate:deploy
pm2 restart medi-service
```

---

## 🔑 Key Differences: Local vs Production

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **Database** | `localhost:5432` | Cloud RDS/Managed DB |
| **Connection Pool** | Unlimited | Limited (5-10) |
| **Logging** | `query`, `error`, `warn` | `error` only |
| **Migrations** | `migrate dev` (auto-apply) | `migrate deploy` (manual) |
| **Client Generation** | Manual (`prisma:generate`) | In build step |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Credentials** | `.env` file | Environment variables |
| **SSL** | Optional | Required |

---

## 📝 Common Commands Reference

### Development
```bash
# Generate Prisma Client after schema changes
pnpm prisma:generate

# Open Prisma Studio (visual database editor)
pnpm prisma:studio

# Create and apply migration
pnpm db:migrate:dev --name migration_name

# Reset database (⚠️ deletes all data)
pnpm exec prisma migrate reset

# Pull schema from database
pnpm prisma:pull

# Push schema without migration files (prototyping)
pnpm prisma:push
```

### Production
```bash
# Apply pending migrations (safe for production)
pnpm db:migrate:deploy

# Check migration status
pnpm exec prisma migrate status

# Validate schema
pnpm exec prisma validate
```

### Debugging
```bash
# View generated SQL
pnpm exec prisma migrate diff

# Check connection
pnpm exec prisma db execute --stdin < test.sql
```

---

## 🎯 Usage in Your Code

### Basic CRUD Example

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(data: { email: string; name: string }) {
    return this.prisma.users.create({ data });
  }

  // Read
  async findOne(id: string) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  // Update
  async update(id: string, data: { name?: string }) {
    return this.prisma.users.update({ where: { id }, data });
  }

  // Delete
  async remove(id: string) {
    return this.prisma.users.delete({ where: { id } });
  }

  // With relations
  async findWithAppointments(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
      include: { appointments: true }
    });
  }
}
```

---

## 🐛 Troubleshooting

### Error: "PrismaClient is unable to run in production"
```bash
# Regenerate client
pnpm prisma:generate
```

### Error: "Can't reach database"
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
pnpm exec prisma db execute --stdin <<< "SELECT 1;"
```

### Error: "Migration conflicts"
```bash
# View status
pnpm exec prisma migrate status

# Resolve conflicts
pnpm exec prisma migrate resolve --applied "migration_name"
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS + Prisma Guide](https://docs.nestjs.com/recipes/prisma)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

## ✅ Your Setup Status

- ✅ Prisma installed
- ✅ Schema pulled from database
- ✅ Prisma Client generated
- ✅ PrismaService created
- ✅ PrismaModule created (global)
- ✅ Scripts configured
- ✅ Environment templates created

**Next Steps:**
1. Import `PrismaModule` in `AppModule`
2. Start using `PrismaService` in your repositories
3. Test with `pnpm start:dev`
