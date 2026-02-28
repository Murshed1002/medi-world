# Prisma to MikroORM Conversion Guide

## Quick Reference

### Basic Operations

**Prisma:**
```typescript
// Find one
const user = await prisma.auth_users.findUnique({ where: { id } });

// Find many
const users = await prisma.auth_users.findMany({ where: { role: 'PATIENT' } });

// Create
const user = await prisma.auth_users.create({ data: { phone_number: '123', role: 'PATIENT' } });

// Update
await prisma.auth_users.update({ where: { id }, data: { email: 'test@test.com' } });

// Delete
await prisma.auth_users.delete({ where: { id } });

// Count
const count = await prisma.auth_users.count({ where: { role: 'PATIENT' } });
```

**MikroORM:**
```typescript
// Find one
const user = await em.findOne(AuthUsers, { id });

// Find many
const users = await em.find(AuthUsers, { role: 'PATIENT' });

// Create
const user = em.create(AuthUsers, { phoneNumber: '123', role: 'PATIENT' });
await em.persistAndFlush(user);

// Update
const user = await em.findOne(AuthUsers, { id });
user.email = 'test@test.com';
await em.flush();

// Delete
const user = await em.findOne(AuthUsers, { id });
await em.removeAndFlush(user);

// Count
const count = await em.count(AuthUsers, { role: 'PATIENT' });
```

### Relations

**Prisma (with include):**
```typescript
const user = await prisma.auth_users.findUnique({
  where: { id },
  include: { patients: true }
});
```

**MikroORM (with populate):**
```typescript
const user = await em.findOne(AuthUsers, { id }, { populate: ['patient'] });
```

### Transactions

**Prisma:**
```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.auth_users.create({ data: {...} });
  await tx.patients.create({ data: {...} });
});
```

**MikroORM:**
```typescript
await em.transactional(async (em) => {
  const user = em.create(AuthUsers, {...});
  const patient = em.create(Patients, {...});
  await em.flush();
});
```

### Field Name Mapping

Remember that MikroORM entities use camelCase while database uses snake_case:

- `phone_number` → `phoneNumber`
- `is_active` → `isActive`
- `created_at` → `createdAt`
- `auth_user_id` → `authUserId`

### Raw SQL Queries

**Prisma:**
```typescript
await prisma.$executeRaw`UPDATE users SET status = ${status}`;
const result = await prisma.$queryRaw`SELECT * FROM users`;
```

**MikroORM:**
```typescript
await em.execute('UPDATE users SET status = ?', [status]);
const result = await em.execute('SELECT * FROM users');
```

## Services to Convert

1. ✅ webhook.service.ts - DONE (using WebhookEvents entity)
2. ⚠️ auth.service.ts - IN PROGRESS
3. ⚠️ patients.service.ts - PENDING
4. ⚠️ doctors.service.ts - PENDING
5. ⚠️ appointments.repository.ts - PENDING
6. ⚠️ payment.service.ts - PENDING (uses raw pg Pool, needs full MikroORM conversion)

## Common Patterns

### Pattern 1: Find or Create
```typescript
// Prisma
let user = await prisma.auth_users.findUnique({ where: { phone_number } });
if (!user) {
  user = await prisma.auth_users.create({ data: { phone_number, role: 'PATIENT' } });
}

// MikroORM
let user = await em.findOne(AuthUsers, { phoneNumber });
if (!user) {
  user = em.create(AuthUsers, { phoneNumber, role: 'PATIENT' });
  await em.persistAndFlush(user);
}
```

### Pattern 2: Update Existing
```typescript
// Prisma
await prisma.auth_users.update({
  where: { id },
  data: { email: 'new@email.com' }
});

// MikroORM
const user = await em.findOne(AuthUsers, { id });
user.email = 'new@email.com';
await em.flush(); // Auto-detects changes
```

### Pattern 3: Complex Queries
```typescript
// Prisma
const doctors = await prisma.doctors.findMany({
  where: {
    is_verified: true,
    OR: [
      { full_name: { contains: search, mode: 'insensitive' } },
      { specialization: { contains: search, mode: 'insensitive' } }
    ]
  },
  include: {
    auth_users: { select: { email: true } },
    doctor_clinics: { include: { clinics: true } }
  }
});

// MikroORM
const doctors = await em.find(Doctors, {
  isVerified: true,
  $or: [
    { fullName: { $ilike: `%${search}%` } },
    { specialization: { $ilike: `%${search}%` } }
  ]
}, {
  populate: ['authUser', 'doctorClinics.clinic']
});
```

## Important Notes

1. **No Auto-Flush**: MikroORM requires explicit `flush()` or `persistAndFlush()` calls
2. **Unit of Work**: MikroORM tracks entity changes automatically - just modify and `flush()`
3. **Relations**: Use `populate` option instead of `include`
4. **Field Names**: Entity properties are camelCase, but `fieldName` decorator maps to snake_case in DB
5. **Transactions**: Use `em.transactional()` instead of `$transaction()`
6. **Raw Queries**: Use `em.execute()` or better yet, create proper entities

## Next Steps

All service files need to be updated to use:
- EntityManager (`em`) methods
- Proper entity classes (AuthUsers, Patients, Doctors, etc.)
- MikroORM query syntax ($or, $and, $ilike, etc.)
- flush() for persistence

This ensures type safety, proper change tracking, and eliminates the need for Prisma's code generation.
