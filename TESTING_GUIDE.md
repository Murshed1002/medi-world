# Test Doctors Listing API

## Quick Test Steps

### 1. Start Backend
```bash
cd medi-service
pnpm run start:dev
```

Backend should start on: http://localhost:8080

### 2. Test API Endpoint

#### Test 1: Get All Doctors
```bash
curl http://localhost:8080/doctors
```

Expected: JSON array of doctors

#### Test 2: Search by Specialization
```bash
curl 'http://localhost:8080/doctors?specialization=Cardiologist'
```

Expected: Only cardiologists

#### Test 3: Filter by City
```bash
curl 'http://localhost:8080/doctors?city=New%20York'
```

Expected: Only doctors in New York

#### Test 4: Available Today + Video Consultation
```bash
curl 'http://localhost:8080/doctors?availableToday=true&supportsVideo=true'
```

Expected: Doctors available today with video support

#### Test 5: Sort by Rating
```bash
curl 'http://localhost:8080/doctors?sortBy=rating&sortOrder=desc'
```

Expected: Doctors sorted by rating (highest first)

#### Test 6: Sort by Fee (Low to High)
```bash
curl 'http://localhost:8080/doctors?sortBy=fee&sortOrder=asc'
```

Expected: Doctors sorted by fee (lowest first)

### 3. Start Frontend
```bash
cd client-app
pnpm run dev
```

Frontend starts on: http://localhost:3000

### 4. Test Frontend
Visit: http://localhost:3000/patient/doctors

**Expected Behavior:**
1. Loading spinner shows initially
2. Doctors list loads from API
3. Can search by name/specialization
4. Can filter by location
5. Can filter by specialization
6. Can toggle "Available Today"
7. Can toggle "Video Consultation"
8. Can toggle "Female Doctor"
9. Can adjust price slider
10. Can sort by rating/fee

### 5. Check Redis Cache
In backend logs, you should see:
- First request: "Doctors list cache miss, fetching from DB"
- Subsequent requests (within 5 minutes): "Doctors list cache hit"

## Sample Response Format

```json
[
  {
    "id": "uuid-here",
    "name": "Dr. John Smith",
    "specialization": "Cardiologist",
    "rating": 4.7,
    "reviews": 145,
    "fee": 150,
    "availableToday": true,
    "nextSlot": "Mon, 10:00 AM",
    "clinic": "Heart Care Clinic, 123 Main St, New York",
    "avatarUrl": "https://...",
    "online": true,
    "city": "New York",
    "supportsVideo": true,
    "isFemale": false
  }
]
```

## Troubleshooting

### Backend Not Starting
- Check if PostgreSQL is running
- Check if Redis is running
- Verify .env file has correct DATABASE_URL and REDIS_URL

### No Doctors Returned
- Check if doctors table has data
- Run migrations if needed: `RUN_MIGRATIONS=true pnpm run start:dev`
- Check prisma studio: `npx prisma studio`

### Frontend Shows Error
- Verify backend is running on port 8080
- Check browser console for detailed error
- Verify MEDI_SERVICE_HOST in frontend .env (if exists)

### Cache Not Working
- Check if Redis is running: `redis-cli ping` (should return PONG)
- Check backend logs for Redis connection errors
