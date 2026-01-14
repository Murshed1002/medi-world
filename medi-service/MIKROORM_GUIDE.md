# 🚀 MikroORM Setup - Enterprise Ready

**Congratulations!** You're now using MikroORM - the most modern TypeScript-first ORM.

---

## ✨ Why MikroORM is Better

### **vs Prisma:**
✅ No schema syncing complexity  
✅ No code generation needed  
✅ Full TypeScript inference  
✅ Unit of Work pattern (automatic change tracking)  
✅ True database-first approach  

### **vs TypeORM:**
✅ Better TypeScript support  
✅ Cleaner API  
✅ Better performance  
✅ More modern architecture  

---

## 🎯 Quick Start

### **1. Fresh Environment Setup**

```bash
# Clone and install
git clone <repo>
cd medi-service
pnpm install

# Database already exists? Just run migrations
pnpm migration:up

# Start developing
pnpm start:dev
```

### **2. Production Deployment**

```bash
# In Dockerfile or CI/CD
RUN_MIGRATIONS=true pnpm start:prod
```

That's it! Migrations run automatically on startup.

---

## 📝 Creating Migrations

### **Method 1: Auto-Generate from Entity Changes**

```bash
# Make changes to your entities
# Then generate migration
pnpm migration:create --name=add_doctor_reviews

# This creates: src/db/mikro-migrations/Migration[timestamp]_add_doctor_reviews.ts
```

### **Method 2: Write Custom SQL**

```typescript
// src/db/mikro-migrations/Migration20260113_add_reviews.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20260113_add_reviews extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE doctor_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        doctor_id UUID REFERENCES doctors(id),
        rating INT NOT NULL,
        comment TEXT
      );
    `);
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE doctor_reviews;');
  }
}
```

---

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm migration:create` | Create new migration |
| `pnpm migration:up` | Run pending migrations |
| `pnpm migration:down` | Rollback last migration |
| `pnpm migration:pending` | List pending migrations |
| `pnpm schema:update` | Sync schema (dev only) |
| `pnpm start:dev` | Start with watch mode |

---

## 📚 Working with Entities

### **Creating a New Entity**

```typescript
// src/entities/doctor-reviews.entity.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Doctors } from './doctors.entity';

@Entity({ tableName: 'doctor_reviews' })
export class DoctorReviews {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Doctors)
  doctor!: Doctors;

  @Property()
  rating!: number;

  @Property({ type: 'text', nullable: true })
  comment?: string;

  @Property({ onCreate: () => new Date() })
  created_at: Date = new Date();
}
```

### **Using in Repository**

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Appointments } from '../entities/appointments.entity';

@Injectable()
export class AppointmentsService {
  constructor(private readonly em: EntityManager) {}

  // Simple query
  async findAll() {
    return this.em.find(Appointments, {}, {
      populate: ['patient', 'doctor', 'clinic'],
    });
  }

  // With filtering
  async findByDoctor(doctorId: string) {
    return this.em.find(Appointments, {
      doctor: doctorId,
      status: 'confirmed',
    });
  }

  // Create
  async create(data: any) {
    const appointment = this.em.create(Appointments, data);
    await this.em.persistAndFlush(appointment);
    return appointment;
  }

  // Update (automatic change tracking!)
  async update(id: string, data: any) {
    const appointment = await this.em.findOneOrFail(Appointments, { id });
    appointment.status = data.status; // Just assign - no need to call save!
    await this.em.flush(); // Flush commits all changes
    return appointment;
  }

  // Transaction
  async bookWithPayment(appointmentData: any, paymentData: any) {
    return this.em.transactional(async (em) => {
      const appointment = em.create(Appointments, appointmentData);
      // ... create payment
      // Both saved atomically
    });
  }
}
```

---

## 🔄 Workflows

### **Development**

```bash
# 1. Create/modify entities
# 2. Generate migration
pnpm migration:create --name=my_feature

# 3. Edit migration if needed
# 4. Run migration
pnpm migration:up

# 5. Start developing
pnpm start:dev
```

### **Adding New Migration**

```bash
# Automatic from entity changes
pnpm migration:create --name=add_feature

# Or manual: Create file in src/db/mikro-migrations/
# Then run
pnpm migration:up
```

### **Production Deploy**

```bash
# Option 1: Auto-migration
RUN_MIGRATIONS=true pnpm start:prod

# Option 2: Manual migration
pnpm migration:up
pnpm start:prod
```

---

## 🎓 Learning Resources

### **Key Concepts**

**1. Unit of Work**
MikroORM tracks all entity changes automatically. Just modify objects and call `flush()`.

**2. Identity Map**
Each entity is loaded only once per request. No duplicate queries.

**3. Lazy Loading**
Relations load automatically when accessed (in async context).

**4. Transactions**
Use `em.transactional()` for atomic operations.

### **Documentation**
- Official Docs: https://mikro-orm.io/docs
- NestJS Integration: https://mikro-orm.io/docs/usage-with-nestjs

---

## 🐛 Troubleshooting

### **Issue: Entity not found**
**Solution:** Add to `DatabaseModule` imports

### **Issue: Migrations not running**
**Solution:** Check `RUN_MIGRATIONS=true` in .env

### **Issue: TypeScript errors**
**Solution:** Rebuild: `pnpm build`

---

## 🎉 What Changed from Prisma

| Prisma | MikroORM |
|--------|----------|
| `prisma/schema.prisma` | TypeScript entities |
| `prisma generate` | Not needed! |
| `prisma db pull` | Not needed! |
| `prisma migrate` | `mikro-orm migration` |
| `PrismaService` | `EntityManager` |
| Manual relations | Automatic with decorators |

---

## 📊 Performance Tips

1. **Use populate wisely** - Only load relations you need
2. **Batch operations** - Use `em.flush()` once after multiple changes
3. **Use transactions** - `em.transactional()` for complex ops
4. **Query optimization** - Use QueryBuilder for complex queries

---

## 🚀 Next Steps

1. ✅ Run your first migration: `pnpm migration:up`
2. ✅ Start the app: `pnpm start:dev`
3. ✅ Test the API endpoints
4. ✅ Add new features using entities

**You're all set!** MikroORM is now handling your database. 🎊
