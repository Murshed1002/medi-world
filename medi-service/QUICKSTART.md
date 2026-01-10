# 🚀 Prisma Quick Start Guide

## ✅ Setup Complete!

Your Prisma ORM is now fully configured and ready to use.

---

## 📁 What Was Set Up

### Files Created
- ✅ `prisma/schema.prisma` - Your database schema (12 models)
- ✅ `prisma.config.ts` - Prisma configuration
- ✅ `src/common/prisma/prisma.service.ts` - Database service
- ✅ `src/common/prisma/prisma.module.ts` - Global module
- ✅ `.env.local` - Local environment template
- ✅ `.env.production.template` - Production template
- ✅ `.env.staging.template` - Staging template

### Files Updated
- ✅ `package.json` - Added Prisma scripts
- ✅ `src/app.module.ts` - Imported PrismaModule
- ✅ `.gitignore` - Protected sensitive files

---

## 🎯 How to Use

### 1. Start Development Server

```bash
# Copy environment file
cp .env.local .env

# Start the server
pnpm start:dev
```

### 2. Use Prisma in Your Code

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class YourService {
  constructor(private prisma: PrismaService) {}

  async getPatients() {
    return this.prisma.patients.findMany({
      include: { appointments: true }
    });
  }

  async createAppointment(data: any) {
    return this.prisma.appointments.create({ data });
  }
}
```

---

## 🔧 Common Commands

### Development
```bash
# Start dev server with hot reload
pnpm start:dev

# Open Prisma Studio (visual DB editor)
pnpm prisma:studio

# Pull latest schema from database
pnpm prisma:pull

# Generate Prisma Client after schema changes
pnpm prisma:generate
```

### Building
```bash
# Build for production (includes prisma generate)
pnpm build
```

### Database Migrations
```bash
# Create new migration
pnpm db:migrate:dev --name your_migration_name

# Apply migrations in production
pnpm db:migrate:deploy
```

---

## 🌍 Environment Setup

### Local Development
Already configured in `.env`:
```env
DATABASE_URL=postgresql://root:root@localhost:5432/mediworld_db
NODE_ENV=development
```

### Production
When deploying, set these environment variables:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

---

## 📊 Your Database Models

✅ **12 Models Available:**
1. `appointments` - Appointment bookings
2. `patients` - Patient records
3. `doctors` - Doctor profiles
4. `clinics` - Clinic locations
5. `auth_users` - Authentication
6. `doctor_clinics` - Doctor-clinic relationships
7. `doctor_slots` - Available time slots
8. `payments` - Payment records
9. `queue_entries` - Queue management
10. `clinic_queues` - Clinic queues
11. `audit_logs` - Audit trail
12. `schema_migrations` - Migration history

---

## 🔍 Prisma Studio

Visual database editor - run:
```bash
pnpm prisma:studio
```

Opens at http://localhost:5555

---

## 📖 Key Differences: Local vs Production

| Feature | Local | Production |
|---------|-------|------------|
| **Database** | localhost:5432 | Cloud hosted |
| **Migrations** | `migrate dev` | `migrate deploy` |
| **Client Gen** | Manual | In build step |
| **Logging** | Full queries | Errors only |
| **Hot Reload** | ✅ Yes | ❌ No |

---

## 🐛 Troubleshooting

### "Cannot find @prisma/client"
```bash
pnpm prisma:generate
```

### "Database connection error"
```bash
# Check your DATABASE_URL in .env
echo $DATABASE_URL
```

### "Schema changes not reflecting"
```bash
pnpm prisma:generate
pnpm build
```

---

## 📚 Full Documentation

See `PRISMA_SETUP.md` for comprehensive documentation including:
- Detailed local vs production workflows
- Migration strategies
- Advanced usage examples
- Deployment guides
- Best practices

---

## ✨ Next Steps

1. **Test the connection**
   ```bash
   pnpm start:dev
   ```

2. **Explore your database**
   ```bash
   pnpm prisma:studio
   ```

3. **Start building features** using `PrismaService` in your services!

---

**Need Help?** Check:
- [Prisma Docs](https://www.prisma.io/docs)
- [NestJS + Prisma](https://docs.nestjs.com/recipes/prisma)
- `PRISMA_SETUP.md` (detailed guide in this folder)
