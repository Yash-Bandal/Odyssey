# Odyssey Next.js Backend

Modern Next.js backend API with Clerk authentication and MongoDB database for the Odyssey productivity dashboard.

## Features

- ✅ **Next.js 15** App Router
- 🔐 **Clerk Authentication** with proper middleware
- 🗄️ **MongoDB** with Mongoose ODM
- 🚀 **TypeScript** for type safety
- 🔥 **API Routes** for streaks, achievements, and user management
- 🌐 **CORS** configured for frontend integration

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **Language**: TypeScript
- **Runtime**: Node.js

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier available)
- Clerk account (free tier available)

## Quick Start

### 1. Get Your API Keys

**Clerk Keys:**
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. Copy:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

**MongoDB URI:**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 2. Install Dependencies

```bash
cd nextjs-backend
npm install
```

### 3. Configure Environment

Create `.env.local` from the example:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/odyssey
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

### 4. Run the Development Server

```bash
npm run dev
```

Server will start at: **http://localhost:5000**

### 5. Test the API

Visit http://localhost:5000 to see the API documentation page.

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

## Project Structure

```
nextjs-backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   │   └── route.ts          # Health check endpoint
│   │   │   ├── users/
│   │   │   │   └── route.ts          # User initialization
│   │   │   └── streaks/
│   │   │       ├── route.ts          # Get/Post streaks
│   │   │       ├── reset/
│   │   │       │   └── route.ts      # Reset user data
│   │   │       └── export/
│   │   │           └── route.ts      # Export user data
│   │   ├── layout.tsx                # Root layout with ClerkProvider
│   │   └── page.tsx                  # API documentation page
│   ├── lib/
│   │   └── mongodb.ts                # MongoDB connection utility
│   ├── models/
│   │   └── index.ts                  # Mongoose models
│   └── middleware.ts                 # Clerk middleware
├── .env.local                        # Environment variables (not in git)
├── .env.example                      # Environment template
├── next.config.mjs                   # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

## API Endpoints

All endpoints (except `/health`) require Clerk authentication via Bearer token.

### Public Endpoints

#### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T10:00:00.000Z",
  "database": "connected"
}
```

### Protected Endpoints

All require `Authorization: Bearer <clerk_jwt_token>` header.

#### POST /api/users
Initialize or update user

**Response:**
```json
{
  "success": true,
  "user_id": "user_2abc123...",
  "message": "User created/updated successfully"
}
```

#### GET /api/streaks
Get user's streaks, stats, and achievements

**Response:**
```json
{
  "success": true,
  "streaks": {
    "2026-01-11": {
      "tasks_completed": 5,
      "points_earned": 15,
      "is_completed": true
    }
  },
  "stats": {
    "current_streak": 7,
    "longest_streak": 14,
    "total_active_days": 42,
    "total_points": 630
  },
  "achievements": [1, 3, 7, 14]
}
```

#### POST /api/streaks
Save daily streak data

**Request Body:**
```json
{
  "date": "2026-01-11",
  "tasks_completed": 5,
  "points_earned": 15,
  "is_completed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Streak updated successfully",
  "date": "2026-01-11",
  "stats": { ... },
  "unlocked_achievements": [7]
}
```

#### POST /api/streaks/reset
Reset all user data

**Response:**
```json
{
  "success": true,
  "message": "All user data reset successfully"
}
```

#### GET /api/streaks/export
Export all user data

**Response:**
```json
{
  "user_id": "user_2abc123...",
  "export_date": "2026-01-11T10:00:00.000Z",
  "streaks": [ ... ],
  "achievements": [ ... ],
  "stats": { ... }
}
```

## MongoDB Collections

### users
- `clerkUserId` (String, unique) - Clerk user ID
- `createdAt` (Date) - Account creation date
- `lastActive` (Date) - Last activity timestamp

### dailystreaks
- `userId` (String) - Reference to user
- `date` (String) - Date in YYYY-MM-DD format
- `tasksCompleted` (Number) - Number of tasks completed
- `pointsEarned` (Number) - Points earned
- `isCompleted` (Boolean) - Whether day is completed
- `createdAt` (Date) - Creation timestamp
- `updatedAt` (Date) - Last update timestamp

### achievements
- `userId` (String) - Reference to user
- `achievementType` (String) - Type of achievement (e.g., "streak")
- `milestone` (Number) - Milestone number (1, 3, 7, 14, 30, 60, 100)
- `unlockedAt` (Date) - Unlock timestamp

### userstats
- `userId` (String, unique) - Reference to user
- `totalPoints` (Number) - Total points earned
- `currentStreak` (Number) - Current active streak
- `longestStreak` (Number) - Longest streak ever
- `totalActiveDays` (Number) - Total days with activity
- `lastUpdated` (Date) - Last update timestamp

## Connecting Frontend

Update your React frontend's `streakService.js` to point to this backend:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

The frontend already supports Clerk authentication, so it will automatically include the JWT token in requests.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `MONGODB_URI`
   - `NEXT_PUBLIC_FRONTEND_URL`
4. Deploy!

### MongoDB Atlas Setup

1. Whitelist Vercel IP ranges or use `0.0.0.0/0` for development
2. Create database user with read/write permissions
3. Get connection string from Atlas dashboard

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Troubleshooting

### "Unauthorized" Errors
- Check Clerk keys in `.env.local`
- Verify frontend is sending Authorization header
- Check Clerk middleware is working

### "Database Disconnected"
- Verify MongoDB URI in `.env.local`
- Check MongoDB Atlas whitelist
- Ensure database user has correct permissions

### CORS Errors
- Check `NEXT_PUBLIC_FRONTEND_URL` in `.env.local`
- Verify frontend origin matches configured URL

## Migration from Flask

This Next.js backend is a drop-in replacement for the Flask backend:

- ✅ Same API endpoints and responses
- ✅ Same authentication flow (Clerk JWT)
- ✅ Same data structure
- ✅ MongoDB instead of SQLite (better scalability)
- ✅ Built-in TypeScript type safety

Simply update the frontend to point to `http://localhost:5000` instead of the Flask server.

## Security Features

- 🔒 Clerk JWT validation on all protected routes
- 🔐 Environment variables for sensitive data
- 🛡️ MongoDB injection protection via Mongoose
- 🚫 CORS properly configured
- ✅ User data isolation by Clerk user ID

## License

MIT

## Support

For issues:
- Check [Clerk documentation](https://clerk.com/docs/nextjs)
- Check [Next.js documentation](https://nextjs.org/docs)
- Check [MongoDB documentation](https://www.mongodb.com/docs/)
