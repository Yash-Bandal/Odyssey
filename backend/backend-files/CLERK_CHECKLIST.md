# 🔐 Clerk Configuration Checklist

Complete this checklist to set up Clerk authentication for your Odyssey app.

## ✅ Pre-Setup

- [ ] I have a Clerk account (sign up at [clerk.com](https://clerk.com))
- [ ] Node.js is installed on my system
- [ ] Python is installed on my system
- [ ] I have the project cloned locally

## 📋 Clerk Dashboard Setup

### Step 1: Create Application
- [ ] Logged into Clerk Dashboard
- [ ] Clicked "Create Application"
- [ ] Named the application (e.g., "Odyssey Dashboard")
- [ ] Selected authentication methods:
  - [ ] Email/Password ✅ (Recommended)
  - [ ] Email Link (optional)
  - [ ] Google OAuth (optional)
  - [ ] GitHub OAuth (optional)
- [ ] Clicked "Create Application"

### Step 2: Get API Keys
- [ ] Navigated to "API Keys" in Clerk Dashboard
- [ ] Copied **Publishable Key** (starts with `pk_test_`)
  ```
  My key: pk_test_______________________
  ```
- [ ] Copied **Secret Key** (starts with `sk_test_`)
  ```
  My key: sk_test_______________________
  ```
  ⚠️ **KEEP SECRET - NEVER COMMIT TO GIT**

### Step 3: Configure Settings (Optional but Recommended)
- [ ] Go to "User & Authentication" → "Email, Phone, Username"
  - [ ] Email is required ✅
  - [ ] Username is optional (your choice)
  - [ ] Phone number is optional (your choice)

- [ ] Go to "User & Authentication" → "Social Connections"
  - [ ] Add Google (optional)
  - [ ] Add GitHub (optional)

- [ ] Go to "Paths"
  - [ ] Set sign-in URL: `/sign-in`
  - [ ] Set sign-up URL: `/sign-up`
  - [ ] Set home URL: `/`

## 🖥️ Backend Configuration

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Create Virtual Environment
**Windows:**
- [ ] Run: `python -m venv myvenv`
- [ ] Run: `myvenv\Scripts\activate`

**macOS/Linux:**
- [ ] Run: `python3 -m venv myvenv`
- [ ] Run: `source myvenv/bin/activate`

### Step 3: Install Dependencies
- [ ] Run: `pip install -r requirements.txt`
- [ ] Verify no errors in installation

### Step 4: Create .env File
- [ ] Copy `.env.example` to `.env`
  - Windows: `copy .env.example .env`
  - macOS/Linux: `cp .env.example .env`

- [ ] Open `.env` in a text editor
- [ ] Replace `sk_test_your_secret_key_here` with your actual Clerk Secret Key
- [ ] File should look like:
  ```env
  CLERK_SECRET_KEY=sk_test_ACTUAL_KEY_HERE
  FLASK_ENV=development
  DATABASE_PATH=streaks.db
  ```
- [ ] Save the file
- [ ] Verify `.env` is NOT committed to Git (check `.gitignore`)

## 💻 Frontend Configuration

### Step 1: Navigate to Frontend
```bash
cd frontend/health-dashboard
```

### Step 2: Install Dependencies
- [ ] Run: `npm install`
- [ ] Verify `@clerk/clerk-react` is in node_modules

### Step 3: Create .env.local File
- [ ] Copy `.env.example` to `.env.local`
  - Windows: `copy .env.example .env.local`
  - macOS/Linux: `cp .env.example .env.local`

- [ ] Open `.env.local` in a text editor
- [ ] Replace `pk_test_your_publishable_key_here` with your actual Clerk Publishable Key
- [ ] File should look like:
  ```env
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_ACTUAL_KEY_HERE
  ```
- [ ] Save the file
- [ ] Verify `.env.local` is NOT committed to Git (check `.gitignore`)

## 🚀 Launch Application

### Step 1: Start Backend
- [ ] Open Terminal/PowerShell window #1
- [ ] Navigate to backend: `cd backend`
- [ ] Activate venv:
  - Windows: `myvenv\Scripts\activate`
  - macOS/Linux: `source myvenv/bin/activate`
- [ ] Run: `python app.py`
- [ ] Verify output shows:
  ```
  ✅ Database initialized successfully!
  🚀 Starting Flask server...
  * Running on http://0.0.0.0:5000
  ```
- [ ] Backend is running ✅

### Step 2: Start Frontend
- [ ] Open Terminal/PowerShell window #2
- [ ] Navigate to frontend: `cd frontend/health-dashboard`
- [ ] Run: `npm run dev`
- [ ] Verify output shows:
  ```
  VITE vX.X.X ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ```
- [ ] Frontend is running ✅

## 🧪 Testing Authentication

### Test 1: Sign Up
- [ ] Open browser: `http://localhost:5173`
- [ ] Should redirect to sign-in page automatically
- [ ] Click "Sign Up" or "Don't have an account?"
- [ ] Enter:
  - [ ] Email address
  - [ ] Password (min 8 characters)
- [ ] Click "Sign Up"
- [ ] Verify: Redirected to dashboard (/)
- [ ] Verify: Your name/avatar appears in header
- [ ] ✅ Sign Up works!

### Test 2: User Menu
- [ ] Click on your avatar in the header (top right)
- [ ] Verify dropdown menu appears with:
  - [ ] "Manage account"
  - [ ] "Sign out"
- [ ] Click "Manage account"
- [ ] Verify: Clerk user profile page opens
- [ ] Close the profile modal
- [ ] ✅ User menu works!

### Test 3: Sign Out
- [ ] Click avatar → "Sign out"
- [ ] Verify: Redirected to sign-in page
- [ ] Verify: Cannot access dashboard without signing in
- [ ] ✅ Sign out works!

### Test 4: Sign In
- [ ] From sign-in page, enter your credentials
- [ ] Click "Sign In"
- [ ] Verify: Redirected to dashboard
- [ ] ✅ Sign in works!

### Test 5: Protected Routes
- [ ] While signed in, try visiting:
  - [ ] `http://localhost:5173/` → Dashboard (works)
  - [ ] `http://localhost:5173/StudyManager` → Study Manager (works)
  - [ ] `http://localhost:5173/ConsistencyTracker` → Habit Tracker (works)
- [ ] Sign out
- [ ] Try visiting the same URLs
- [ ] Verify: All redirect to sign-in page
- [ ] ✅ Protected routes work!

### Test 6: API Integration
- [ ] Sign in to the app
- [ ] Go to Habit Tracker (`/ConsistencyTracker`)
- [ ] Complete a task
- [ ] Submit for the day
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Look for requests to `localhost:5000/api/streaks`
- [ ] Click on a request
- [ ] Verify in "Headers" tab:
  - [ ] `Authorization: Bearer eyJ...` is present
- [ ] Verify response shows success
- [ ] ✅ API integration works!

## 🎉 Final Verification

- [ ] All tests passed above
- [ ] No console errors in browser DevTools
- [ ] Backend terminal shows no errors
- [ ] Frontend terminal shows no errors
- [ ] Users can sign up, sign in, and sign out
- [ ] Protected routes are working
- [ ] API calls include authentication
- [ ] User data is isolated (each user sees only their data)

## 📚 Next Steps

Now that authentication is set up:

1. **Customize Clerk Settings** (Optional)
   - [ ] Add your logo in Clerk Dashboard
   - [ ] Customize sign-in page colors
   - [ ] Set up email templates
   - [ ] Enable additional OAuth providers

2. **Explore the App**
   - [ ] Set up your daily goals in Dashboard
   - [ ] Track habits in Consistency Tracker
   - [ ] Add study sessions in Study Manager
   - [ ] Build your streak! 🔥

3. **Share with Others**
   - [ ] Invite friends to create accounts
   - [ ] Test multi-user functionality

## 🆘 Troubleshooting

If something doesn't work:

### "Missing Publishable Key" Error
- [ ] Check `.env.local` exists in `frontend/health-dashboard/`
- [ ] Check key starts with `pk_test_`
- [ ] Restart Vite dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Authentication Error" in API
- [ ] Check `.env` exists in `backend/`
- [ ] Check secret key starts with `sk_test_`
- [ ] Restart Flask server: Stop (Ctrl+C) and run `python app.py` again

### Can't Access Dashboard After Sign In
- [ ] Check browser console (F12) for errors
- [ ] Clear browser cache and cookies
- [ ] Try signing out and in again

### Still Having Issues?
- [ ] Read [CLERK_SETUP.md](CLERK_SETUP.md) for detailed guide
- [ ] Read [QUICKSTART.md](QUICKSTART.md) for quick commands
- [ ] Check Clerk Dashboard for any error messages
- [ ] Open an issue on GitHub

---

## ✅ Configuration Complete!

When all checkboxes are checked, your Clerk authentication is fully configured and working! 🎉

**Date Completed:** ___________

**Configured By:** ___________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
