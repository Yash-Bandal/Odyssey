# 🚀 Quick Start Guide

Get your Odyssey dashboard running in 5 minutes!

## Prerequisites Check
- [ ] Node.js installed (check: `node --version`)
- [ ] Python installed (check: `python --version`)
- [ ] Git installed

## 1. Get Clerk Keys (2 minutes)

1. Go to [clerk.com](https://clerk.com) → Sign up (free)
2. Create new application → Name it "Odyssey"
3. Copy two keys from "API Keys" section:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## 2. Backend Setup (1 minute)

```bash
cd backend

# Windows
python -m venv myvenv
myvenv\Scripts\activate
pip install -r requirements.txt

# Create .env file and add your Clerk Secret Key
echo CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE > .env
echo FLASK_ENV=development >> .env
echo DATABASE_PATH=streaks.db >> .env
```

```bash
# macOS/Linux
python3 -m venv myvenv
source myvenv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
FLASK_ENV=development
DATABASE_PATH=streaks.db
EOL
```

## 3. Frontend Setup (1 minute)

```bash
cd frontend/health-dashboard

# Install dependencies
npm install

# Windows
echo VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE > .env.local

# macOS/Linux
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE" > .env.local
```

## 4. Start the App (1 minute)

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
myvenv\Scripts\activate  # Windows
# source myvenv/bin/activate  # macOS/Linux
python app.py
```
✅ Backend running at `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend/health-dashboard
npm run dev
```
✅ Frontend running at `http://localhost:5173`

## 5. Create Your Account

1. Open browser → `http://localhost:5173`
2. Click "Sign Up"
3. Enter email and password
4. Start tracking! 🎉

## Troubleshooting

### "Missing Publishable Key"
→ Check `.env.local` file exists in `frontend/health-dashboard/`

### "Authentication Error"
→ Verify Clerk Secret Key in `backend/.env`

### "Cannot find module"
→ Run `npm install` in frontend directory

### "ModuleNotFoundError" in Python
→ Make sure virtual environment is activated
→ Run `pip install -r requirements.txt`

## What's Next?

- Customize your goals in the Dashboard
- Start tracking habits in Habit Manager
- Add study sessions in Study Manager
- Build your streak! 🔥

## Need Help?

- 📖 Full README: [README.md](README.md)
- 🔐 Clerk Setup Guide: [CLERK_SETUP.md](CLERK_SETUP.md)
- 🐛 Issues: Open an issue on GitHub

---

**Pro Tip**: Keep both terminal windows open while using the app. Close them when you're done (Ctrl+C to stop servers).
