# 🚀 Odyssey - Next.js Backend Migration Guide

## What Changed?

Your Odyssey project now has a **modern Next.js backend** with Clerk authentication and MongoDB!

## Project Structure

```
Odyssey/
├── frontend/
│   └── health-dashboard/        # React frontend (unchanged)
│       ├── src/
│       └── .env.local           # Has Clerk Publishable Key ✅
│
├── nextjs-backend/              # ✨ NEW Next.js Backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/             # API routes
│   │   │   ├── layout.tsx       # ClerkProvider wrapper
│   │   │   └── page.tsx         # API docs
│   │   ├── lib/
│   │   │   └── mongodb.ts       # MongoDB connection
│   │   ├── models/
│   │   │   └── index.ts         # Mongoose models
│   │   └── middleware.ts        # Clerk middleware ✅
│   ├── .env.local               # Add your keys here
│   ├── QUICKSTART.md            # 3-step setup
│   ├── SETUP_GUIDE.md           # Detailed guide
│   └── README.md                # Full documentation
│
└── backend/                     # Old Flask backend (can keep or remove)
    └── app.py
```

## Quick Start

### 1. Get MongoDB URI

**Sign up for MongoDB Atlas (Free):**
1. Visit: https://mongodb.com/cloud/atlas
2. Create account
3. Create free M0 cluster
4. Add database user
5. Allow network access (0.0.0.0/0)
6. Get connection string

Example URI:
```
mongodb+srv://username:password@cluster0.abc12.mongodb.net/odyssey
```

### 2. Get Clerk Secret Key

1. Visit: https://dashboard.clerk.com
2. Select your app
3. Go to "API Keys"
4. Copy **Secret Key** (starts with `sk_test_`)

### 3. Configure Backend

Create `nextjs-backend/.env.local`:

```env
# You already have this key ✅
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk

# Add these two keys:
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY
MONGODB_URI=mongodb+srv://YOUR_CONNECTION_STRING

# This is correct:
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

### 4. Start Backend

```bash
cd nextjs-backend
npm install  # First time only
npm run dev
```

Server runs on: **http://localhost:5000**

### 5. Start Frontend

```bash
cd frontend/health-dashboard
npm run dev
```

Frontend runs on: **http://localhost:5173**

## Testing

1. Open: http://localhost:5173
2. Sign in with Clerk
3. Go to Habit Tracker
4. Complete tasks
5. Data saves to MongoDB! 🎉

## Why Next.js Backend?

### Advantages Over Flask

✅ **TypeScript**: Type safety, better IDE support
✅ **MongoDB**: Cloud database, scales automatically
✅ **Serverless**: Deploy to Vercel for free
✅ **Modern**: Latest Next.js App Router patterns
✅ **Integrated**: Clerk middleware built-in
✅ **Fast**: Optimized cold starts
✅ **API Routes**: Clean, organized structure

### Same API, Better Implementation

The Next.js backend provides:
- ✅ Same endpoints as Flask
- ✅ Same response format
- ✅ Same authentication (Clerk JWT)
- ✅ Drop-in replacement (no frontend changes needed)

## API Endpoints

All at `http://localhost:5000/api`:

- `GET /health` - Health check (public)
- `POST /users` - Initialize user (protected)
- `GET /streaks` - Get user data (protected)
- `POST /streaks` - Save streak (protected)
- `POST /streaks/reset` - Reset data (protected)
- `GET /streaks/export` - Export data (protected)

## Documentation

### For Backend Setup
1. **QUICKSTART.md** - 3-step setup (fastest)
2. **SETUP_GUIDE.md** - Detailed walkthrough
3. **README.md** - Complete API documentation

### For Frontend
- Frontend is unchanged
- Already configured for http://localhost:5000
- Clerk authentication works the same

## Troubleshooting

### "MongoDB Connection Failed"

```bash
# Check your connection string
# Should look like:
mongodb+srv://user:pass@cluster.mongodb.net/odyssey
```

**Fix:**
1. Verify password is correct
2. Check Network Access in MongoDB Atlas
3. Add IP: 0.0.0.0/0 (allow all)

### "Unauthorized" on API Calls

```bash
# Check .env.local has both keys
CLERK_SECRET_KEY=sk_test_...
```

**Fix:**
1. Add Clerk Secret Key to `.env.local`
2. Restart backend server (Ctrl+C, npm run dev)

### Can't Access Backend

```bash
# Make sure you're in the right directory
cd nextjs-backend
npm run dev
```

**Fix:**
- Check port 5000 is not in use
- Stop Flask backend if running
- Visit http://localhost:5000 to verify

## Migration Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster created in Atlas
- [ ] Database user added
- [ ] Network access configured
- [ ] Connection string copied
- [ ] Clerk Secret Key obtained
- [ ] `nextjs-backend/.env.local` created
- [ ] All keys added to `.env.local`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server starts (`npm run dev`)
- [ ] Health endpoint responds: http://localhost:5000/api/health
- [ ] Frontend connects successfully
- [ ] Can sign in through Clerk
- [ ] Data saves to MongoDB

## Production Deployment

### Deploy Backend to Vercel

```bash
cd nextjs-backend
vercel
```

Or connect GitHub repo to Vercel dashboard.

Add environment variables in Vercel:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`
- `NEXT_PUBLIC_FRONTEND_URL` (your frontend URL)

### Deploy Frontend to Vercel/Netlify

Update `streakService.js`:
```javascript
const API_BASE_URL = 'https://your-backend.vercel.app/api';
```

## Data Persistence

### MongoDB Collections

Your data is stored in 4 collections:

1. **users** - User accounts
2. **dailystreaks** - Daily progress
3. **achievements** - Unlocked badges
4. **userstats** - Aggregated stats

View in MongoDB Atlas:
1. Go to "Database"
2. Click "Browse Collections"
3. See your data in real-time!

## Both Backends Available

You can run both backends simultaneously:

- **Flask**: `python backend/app.py` (port 5000)
- **Next.js**: `npm run dev` in nextjs-backend (port 5000)

Just change the port of one if you want to run both.

## Benefits Summary

| Feature | Flask | Next.js |
|---------|-------|---------|
| Language | Python | TypeScript |
| Database | SQLite | MongoDB |
| Deployment | Manual | Vercel (1-click) |
| Scalability | Limited | Unlimited |
| Type Safety | No | Yes |
| Modern | Good | Excellent |
| Cost | Server needed | Free tier |

## Getting Help

- **Backend Setup**: Read `nextjs-backend/SETUP_GUIDE.md`
- **API Reference**: Read `nextjs-backend/README.md`
- **Quick Start**: Read `nextjs-backend/QUICKSTART.md`
- **Clerk Issues**: https://clerk.com/docs/nextjs
- **MongoDB Issues**: https://mongodb.com/docs
- **Next.js Issues**: https://nextjs.org/docs

## What's Next?

Once everything is running:

1. **Test the app** - Make sure all features work
2. **View MongoDB** - Check data in Atlas dashboard
3. **Explore API** - Visit http://localhost:5000
4. **Deploy** - Push to production when ready
5. **Customize** - Add new features to API routes

---

**Congratulations!** 🎉 

You now have a modern, scalable backend with:
- ✅ Next.js App Router
- ✅ Clerk Authentication  
- ✅ MongoDB Cloud Database
- ✅ TypeScript Type Safety
- ✅ Ready for Production

**Start coding:** `cd nextjs-backend && npm run dev` 🚀
