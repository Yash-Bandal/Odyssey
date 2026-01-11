# 🚀 Next.js Backend Setup Guide

Complete guide to set up the Next.js backend with Clerk and MongoDB.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Clerk account created
- [ ] MongoDB Atlas account created

## Step 1: Get Clerk API Keys (2 minutes)

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in to your account
3. Select your "Odyssey" application (or create one)
4. Click "API Keys" in the sidebar
5. Copy two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`) ⚠️ KEEP SECRET

## Step 2: Set Up MongoDB Atlas (5 minutes)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign In"
3. Create a new project: "Odyssey"
4. Click "Build a Database"
5. Choose **FREE** M0 tier
6. Select a cloud provider and region (closest to you)
7. Click "Create Cluster"

### Configure Database Access

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `odyssey_user`
5. Password: Generate a secure password (copy it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses
5. Click "Confirm"

### Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://odyssey_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/odyssey`

**Final connection string:**
```
mongodb+srv://odyssey_user:your_password@cluster0.xxxxx.mongodb.net/odyssey
```

## Step 3: Install Backend Dependencies

```bash
cd nextjs-backend
npm install
```

Expected output: ~330 packages installed

## Step 4: Configure Environment Variables

Create `.env.local` file:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Clerk Keys (from Step 1)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# MongoDB (from Step 2)
MONGODB_URI=mongodb+srv://odyssey_user:your_password@cluster0.xxxxx.mongodb.net/odyssey

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

⚠️ **IMPORTANT**: Replace all placeholder values with your actual keys!

## Step 5: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
▲ Next.js 15.2.3
- Local:        http://localhost:5000

✓ Starting...
✓ Ready in 2.3s
✅ MongoDB connected successfully
```

## Step 6: Test the Backend

### Test 1: Health Check

Open browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T...",
  "database": "connected"
}
```

✅ If you see this, your backend is working!

### Test 2: API Documentation

Open browser: http://localhost:5000

You should see the API documentation page listing all endpoints.

### Test 3: Protected Endpoint (Optional)

This requires authentication, so you'll test it through the frontend later.

## Step 7: Update Frontend Configuration

Update the frontend to use the new backend:

**File: `frontend/health-dashboard/src/services/streakService.js`**

Change line 2:
```javascript
// Old (Flask)
const API_BASE_URL = 'http://localhost:5000/api';

// New (Next.js) - Same URL, but now it's Next.js!
const API_BASE_URL = 'http://localhost:5000/api';
```

Good news: The URL is the same! The Next.js backend is a drop-in replacement.

## Step 8: Test Full Integration

### Start Both Servers

**Terminal 1 - Next.js Backend:**
```bash
cd nextjs-backend
npm run dev
```

**Terminal 2 - React Frontend:**
```bash
cd frontend/health-dashboard
npm run dev
```

### Test the Flow

1. Open frontend: http://localhost:5173
2. Sign in with Clerk
3. Go to Habit Tracker
4. Complete a task
5. Submit for the day
6. Check backend logs - you should see database activity

## Verification Checklist

- [ ] Next.js backend running on http://localhost:5000
- [ ] Health endpoint returns "connected"
- [ ] MongoDB Atlas cluster shows "Primary" status
- [ ] Frontend connects without errors
- [ ] Can sign in with Clerk
- [ ] Can save streak data
- [ ] Data persists in MongoDB

## Common Issues

### "MongoDB Connection Failed"

**Fix:**
1. Check MongoDB Atlas Network Access allows your IP
2. Verify connection string in `.env.local`
3. Ensure password doesn't contain special characters (if it does, URL-encode them)
4. Check MongoDB cluster is running (not paused)

### "Unauthorized" on API Calls

**Fix:**
1. Verify `CLERK_SECRET_KEY` in `.env.local`
2. Check frontend is sending Authorization header
3. Ensure Clerk keys match between frontend and backend

### "Module not found" Errors

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5000 Already in Use

**Fix:**
1. Stop the Flask backend if it's running
2. Or change Next.js port in `package.json`:
   ```json
   "dev": "next dev -p 5001"
   ```

## Production Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Set Root Directory: `nextjs-backend`
6. Add environment variables (same as `.env.local`)
7. Click "Deploy"

### Update MongoDB for Production

1. In MongoDB Atlas, add Vercel's IP ranges to Network Access
2. Or use `0.0.0.0/0` (less secure but works everywhere)

### Update Frontend

Point frontend to your Vercel URL:
```javascript
const API_BASE_URL = 'https://your-app.vercel.app/api';
```

## Next Steps

- [ ] Explore the API endpoints at http://localhost:5000
- [ ] Check MongoDB Atlas to see your data
- [ ] Customize the models in `src/models/index.ts`
- [ ] Add new API routes as needed
- [ ] Set up production deployment

## Benefits Over Flask Backend

✅ **TypeScript**: Type safety and better autocomplete
✅ **MongoDB**: Scalable cloud database vs SQLite
✅ **Serverless**: Deploy to Vercel for free
✅ **Modern**: Next.js App Router is the latest standard
✅ **Performance**: Faster cold starts and better caching
✅ **Integrated**: Clerk middleware built into Next.js

## Getting Help

- **Next.js Docs**: https://nextjs.org/docs
- **Clerk Docs**: https://clerk.com/docs/nextjs
- **MongoDB Docs**: https://www.mongodb.com/docs/
- **Project README**: `nextjs-backend/README.md`

---

**Congratulations!** 🎉 Your Next.js backend with Clerk and MongoDB is ready!
