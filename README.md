# YB-Odyssey

A productivity and health tracking dashboard with streak management, study tracking, and habit building features. Built with React, Flask, and Clerk authentication.

## Features

- 🔐 **Authentication**: Secure login/signup with Clerk
- 📊 **Dashboard**: Track daily, weekly, and monthly goals
- ✅ **Habit Tracker**: Consistency tracking with streaks and badges
- 📚 **Study Manager**: Manage your study sessions and goals
- 💪 **Workout Tracker**: Track your fitness activities
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 🔥 **Streak System**: Build habits with daily streak tracking
- 🏆 **Achievements**: Unlock badges for milestone achievements

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Clerk Authentication
- Chart.js / Recharts
- Framer Motion

### Backend
- Next js
- MongoDB

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- npm or yarn
- A Clerk account (free tier available)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Yash-Bandal/Odyssey.git
cd Odyssey
```

### 2. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Email/Password authentication (or preferred methods)
4. Copy your **Publishable Key** and **Secret Key**

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv myvenv
myvenv\Scripts\activate

# For macOS/Linux:
# python3 -m venv myvenv
# source myvenv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env and add your Clerk Secret Key
# CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 4. Frontend Setup

```bash
cd frontend/health-dashboard

# Install dependencies
npm install

# Create .env.local file
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # macOS/Linux

# Edit .env.local and add your Clerk Publishable Key
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 5. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
myvenv\Scripts\activate  # Activate venv
python app.py
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend/health-dashboard
npm run dev
```
Frontend will run on `http://localhost:5173`

### 6. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You'll be redirected to the sign-in page
3. Create a new account or sign in
4. Start tracking your habits and goals!

## Project Structure

```
Odyssey/
├── backend/
│   ├── app.py              # Flask application with Clerk auth
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables (not in git)
│   ├── .env.example       # Environment template
│   └── streaks.db         # SQLite database (auto-created)
│
├── frontend/
│   └── health-dashboard/
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── hooks/       # Custom hooks (useStreakService)
│       │   ├── services/    # API services
│       │   └── App.jsx      # Main app with routing
│       ├── .env.local       # Frontend env vars (not in git)
│       ├── .env.example     # Environment template
│       └── package.json     # Dependencies
│
└── README.md
```

## Authentication Flow

1. User visits the app → redirected to Clerk sign-in
2. After authentication → Clerk provides JWT token
3. Frontend stores token and includes in API requests
4. Backend validates JWT and extracts user ID
5. User-specific data is stored/retrieved using Clerk user ID

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header):

- `POST /api/users` - Initialize/update user
- `GET /api/streaks` - Get user streaks and stats
- `POST /api/streaks` - Save daily streak
- `POST /api/streaks/reset` - Reset user data
- `GET /api/streaks/export` - Export user data
- `GET /api/health` - Health check (no auth required)

## Environment Variables

### Backend (.env)
```
CLERK_SECRET_KEY=sk_test_xxxxx
FLASK_ENV=development
DATABASE_PATH=streaks.db
```

### Frontend (.env.local)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

## Development

### Frontend Development
```bash
cd frontend/health-dashboard
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
python app.py    # Start Flask server (debug mode)
```

## Troubleshooting

### "Missing Publishable Key" Error
- Make sure `.env.local` exists in `frontend/health-dashboard/`
- Verify the key starts with `pk_test_` or `pk_live_`

### "Authentication Error" in API Calls
- Check that `.env` exists in `backend/`
- Verify Clerk Secret Key is correct
- Make sure backend server is running

### Database Issues
- Delete `streaks.db` and restart backend to recreate
- Check file permissions in backend directory

### Port Already in Use
- Backend: Change port in `app.py`: `app.run(port=5001)`
- Frontend: Vite will prompt to use a different port automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use this project for learning and development!

## Support

For issues and questions:
- Open an issue on GitHub
- Check Clerk documentation: https://clerk.com/docs

## Acknowledgments

- Clerk for authentication
- React team for the amazing framework
- Flask community for the excellent web framework