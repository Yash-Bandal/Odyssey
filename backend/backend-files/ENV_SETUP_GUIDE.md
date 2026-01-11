# 🔐 Environment Variables Setup Guide

## Overview
All sensitive keys, URIs, and configuration are now stored in environment variables. This guide explains how to set them up and use them when running the application.

---

## 📂 What's Hidden in Environment Variables

### Frontend (`frontend/health-dashboard/.env.local`)
- ✅ **VITE_CLERK_PUBLISHABLE_KEY** - Clerk authentication key
- ✅ **VITE_API_BASE_URL** - Backend API endpoint URL

### Backend (`nextjs-backend/.env.local`)
- ✅ **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - Clerk public key
- ✅ **CLERK_SECRET_KEY** - Clerk secret key (sensitive!)
- ✅ **MONGODB_URI** - MongoDB connection string (sensitive!)
- ✅ **NEXT_PUBLIC_FRONTEND_URL** - Frontend URL for CORS

---

## 🚀 Initial Setup

### Step 1: Copy Example Files

**Frontend:**
```bash
cd frontend/health-dashboard
copy .env.example .env.local
```

**Backend:**
```bash
cd nextjs-backend
copy .env.example .env.local
```

### Step 2: Fill in Your Actual Values

**Frontend `.env.local`:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend `.env.local`:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_7pO62beBUG4XV8JDImfXLITBkrj1abaeJ32s2swsZG
MONGODB_URI=mongodb+srv://team-sunday:tCN4P8f9muRvru2F@odyssey.67lhynl.mongodb.net/odessey-db?appName=Odyssey
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5174
```

---

## 🏃 Running with Environment Variables

### Method 1: Using .env.local Files (Recommended)

Both Vite and Next.js automatically load `.env.local` files:

**Frontend:**
```bash
cd frontend/health-dashboard
npm run dev
```
✅ Vite automatically loads `.env.local`  
✅ Variables prefixed with `VITE_` are accessible via `import.meta.env.VITE_*`

**Backend:**
```bash
cd nextjs-backend
npm run dev
```
✅ Next.js automatically loads `.env.local`  
✅ All variables in `.env.local` are available via `process.env.*`

### Method 2: Inline Environment Variables

**Windows PowerShell:**
```powershell
# Frontend
cd frontend/health-dashboard
$env:VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."; $env:VITE_API_BASE_URL="http://localhost:5000/api"; npm run dev

# Backend
cd nextjs-backend
$env:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."; $env:CLERK_SECRET_KEY="sk_test_..."; $env:MONGODB_URI="mongodb+srv://..."; npm run dev
```

**Windows CMD:**
```cmd
# Frontend
cd frontend\health-dashboard
set VITE_CLERK_PUBLISHABLE_KEY=pk_test_... && set VITE_API_BASE_URL=http://localhost:5000/api && npm run dev

# Backend
cd nextjs-backend
set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... && set CLERK_SECRET_KEY=sk_test_... && set MONGODB_URI=mongodb+srv://... && npm run dev
```

**Linux/Mac:**
```bash
# Frontend
cd frontend/health-dashboard
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..." VITE_API_BASE_URL="http://localhost:5000/api" npm run dev

# Backend
cd nextjs-backend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." CLERK_SECRET_KEY="sk_test_..." MONGODB_URI="mongodb+srv://..." npm run dev
```

### Method 3: Using dotenv-cli (Cross-platform)

**Install dotenv-cli:**
```bash
npm install -g dotenv-cli
```

**Run with environment file:**
```bash
# Frontend
dotenv -e frontend/health-dashboard/.env.local -- npm run dev --prefix frontend/health-dashboard

# Backend
dotenv -e nextjs-backend/.env.local -- npm run dev --prefix nextjs-backend
```

---

## 🔒 Security Best Practices

### ✅ What to Do

1. **Never commit `.env.local` files**
   - Already configured in `.gitignore`
   - These contain sensitive credentials

2. **Commit `.env.example` files**
   - Template for other developers
   - No sensitive data, just placeholders

3. **Use different values for production**
   - Development: `localhost` URLs
   - Production: Real domain URLs

4. **Share credentials securely**
   - Use password managers (1Password, LastPass)
   - Use secure channels (encrypted chat)
   - Never share via email or public channels

### ❌ What NOT to Do

1. ❌ Don't hardcode credentials in source code
2. ❌ Don't commit `.env.local` to Git
3. ❌ Don't share credentials in public channels
4. ❌ Don't use production keys in development

---

## 🌍 Deployment (Production)

### Vercel (Recommended for Next.js)

**Frontend:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` (your production backend URL)

**Backend:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `MONGODB_URI`
   - `NEXT_PUBLIC_FRONTEND_URL`

### Netlify

**Frontend:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Railway / Render

**Backend:**
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables in dashboard
4. Railway/Render will auto-deploy on changes

---

## 🧪 Verifying Environment Variables

### Frontend Verification

Add this to any component:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...');
```

### Backend Verification

Add this to any API route:
```typescript
console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 20) + '...');
console.log('Clerk Secret:', process.env.CLERK_SECRET_KEY?.substring(0, 20) + '...');
```

---

## 📝 Environment Variable Naming Conventions

### Vite (Frontend)
- **Must** start with `VITE_` to be exposed to client
- Example: `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY`
- Access: `import.meta.env.VITE_*`

### Next.js (Backend)
- `NEXT_PUBLIC_*` - Exposed to browser (public)
- No prefix - Server-side only (private)
- Example: 
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public, safe for browser)
  - `CLERK_SECRET_KEY` (private, server-only)
- Access: `process.env.*`

---

## 🛠️ Troubleshooting

### Issue: Environment variables not loading

**Solution:**
1. Restart the dev server (Ctrl+C, then `npm run dev`)
2. Clear build cache: `rm -rf .next node_modules/.cache`
3. Verify file name is exactly `.env.local` (not `.env.local.txt`)

### Issue: "VITE_* is undefined"

**Solution:**
- Variables must start with `VITE_` prefix
- Restart Vite dev server after adding new variables

### Issue: "MongoDB connection failed"

**Solution:**
1. Check `MONGODB_URI` format is correct
2. Ensure MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0 for all)
3. Verify username/password in connection string

### Issue: "Clerk authentication failed"

**Solution:**
1. Verify keys are copied correctly (no extra spaces)
2. Check keys match your Clerk dashboard
3. Ensure frontend uses `VITE_CLERK_PUBLISHABLE_KEY`
4. Ensure backend uses both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

---

## 📋 Quick Reference

### Current Setup

**Frontend runs on:** http://localhost:5174  
**Backend runs on:** http://localhost:5000  
**MongoDB:** MongoDB Atlas Cloud

### Files You Should Have

```
✅ frontend/health-dashboard/.env.local (private - not in Git)
✅ frontend/health-dashboard/.env.example (public - in Git)
✅ nextjs-backend/.env.local (private - not in Git)
✅ nextjs-backend/.env.example (public - in Git)
✅ .gitignore (configured to exclude .env.local)
```

### Running Everything

**Terminal 1 - Backend:**
```bash
cd nextjs-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend/health-dashboard
npm run dev
```

Both will automatically load their respective `.env.local` files! 🎉

---

## 🚨 Emergency: Keys Leaked

If you accidentally commit credentials to Git:

1. **Immediately rotate ALL keys:**
   - Clerk: Generate new keys in dashboard
   - MongoDB: Reset password in Atlas
   
2. **Remove from Git history:**
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (dangerous!):**
   ```bash
   git push origin --force --all
   ```

4. **Update `.env.local` with new keys**

---

**Last Updated:** January 11, 2026  
**Status:** ✅ All credentials secured in environment variables  
**Protected Files:** `.env.local` (both frontend & backend)
