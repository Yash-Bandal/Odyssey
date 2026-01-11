# ⚡ Quick Start: Next.js Backend

Get the Next.js backend running in 3 commands!

## Prerequisites

- Node.js 18+ installed
- Clerk Publishable Key: `pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk` ✅
- Clerk Secret Key: Get from https://dashboard.clerk.com
- MongoDB URI: Get from https://mongodb.com/cloud/atlas

## 3-Step Setup

### 1. Install Dependencies

```bash
cd nextjs-backend
npm install
```

### 2. Configure Environment

Create `.env.local` and add your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
MONGODB_URI=YOUR_MONGODB_URI
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

### 3. Run Server

```bash
npm run dev
```

Visit: http://localhost:5000 🎉

## Get Missing Keys

### Clerk Secret Key

1. Go to https://dashboard.clerk.com
2. Select your app
3. Click "API Keys"
4. Copy the **Secret Key** (starts with `sk_test_`)

### MongoDB URI

#### Quick Setup (5 minutes):

1. Go to https://mongodb.com/cloud/atlas
2. Sign up (free)
3. Create **Free M0 Cluster**
4. **Database Access** → Add User:
   - Username: `odyssey_user`
   - Password: (generate strong password)
5. **Network Access** → Allow Access from Anywhere
6. **Database** → Connect → Application
7. Copy connection string
8. Replace `<password>` and add `/odyssey` at end

Example:
```
mongodb+srv://odyssey_user:MyP@ssw0rd@cluster0.abc12.mongodb.net/odyssey
```

## Test It

```bash
# Test health endpoint
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Run With Frontend

**Terminal 1:**
```bash
cd nextjs-backend
npm run dev
```

**Terminal 2:**
```bash
cd frontend/health-dashboard
npm run dev
```

Open: http://localhost:5173

## Troubleshooting

### MongoDB Connection Error

❌ Error: "MongoNetworkError" or "connection failed"

✅ Fix:
1. Check Network Access in MongoDB Atlas
2. Click "Add IP Address" → "Allow Access from Anywhere"
3. Verify connection string in `.env.local`

### Unauthorized Error

❌ Error: "Unauthorized" on API calls

✅ Fix:
1. Add `CLERK_SECRET_KEY` to `.env.local`
2. Restart Next.js server (Ctrl+C, then `npm run dev`)

### Port Already in Use

❌ Error: "Port 5000 is already in use"

✅ Fix:
- Stop Flask backend if running
- Or change Next.js port in `package.json`:
  ```json
  "dev": "next dev -p 5001"
  ```

## What's Next?

- ✅ Backend running on port 5000
- ✅ Frontend connecting successfully  
- ✅ Data saving to MongoDB
- ✅ Clerk authentication working

Now you can:
- Use the app normally through frontend
- View data in MongoDB Atlas
- Deploy to Vercel for production

## Need More Help?

- 📖 Full Setup: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- 📚 API Docs: [README.md](README.md)
- 🏗️ Architecture: Visit http://localhost:5000

---

**Happy coding!** 🚀
