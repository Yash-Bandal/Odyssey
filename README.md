# Odyssey - Productivity & Education Dashboard

A comprehensive full-stack productivity, habit tracking, and collaborative learning platform with gamified classroom features. Built with Next.js, React, MongoDB, Clerk authentication, and TypeScript.

## 🎯 Overview

Odyssey is a modern educational and productivity platform that combines:
- **Personal Productivity**: Habit tracking, streak management, and goal setting
- **Collaborative Learning**: Classroom management with discussion forums and quizzes
- **Gamification**: Points, leaderboards, and achievements to boost engagement
- **Consistency Tracking**: Visual heatmaps and progress monitoring
- **Health Dashboard**: Monitor study patterns and wellness metrics

## ✨ Key Features

### 📊 Dashboard & Analytics
- **Daily/Weekly/Monthly Goals**: Track study time and goal progress
- **Streaks & Consistency**: Visual streak tracking and consistency metrics
- **Heatmap Calendar**: See your activity patterns at a glance
- **Statistics**: Total points, longest streaks, and milestones

### 🎓 Classroom & Collaboration
- **Group Management**: Teachers create groups with unique codes for students to join
- **Quiz System**: Create, distribute, and grade quizzes with instant scoring
- **Discussion Forum**: Q&A threads for peer-to-peer learning
- **Leaderboard**: Gamified ranking by points within each group
- **Real-time Updates**: Instant leaderboard and achievement notifications

### 🎮 Gamification System
- **Point System**: Earn points for quiz answers (+5), discussion replies (+5)
- **Group Leaderboards**: Real-time rankings within classroom groups
- **Achievements**: Unlock badges for milestones (streaks, points, etc.)
- **Role-based Access**: Separate teacher and student experiences

### 📚 Productivity Features
- **Study Manager**: Plan and track study sessions
- **Workout Tracker**: Log fitness activities
- **Consistency Tracker**: Monitor daily habit completion
- **Export Data**: Download your progress data

### 🌓 User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: Clerk-powered auth with email verification
- **Smooth Animations**: Framer Motion for polished transitions

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern UI library with hooks
- **Vite**: Lightning-fast build tool
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Router v7**: Client-side routing
- **Clerk React SDK**: Authentication UI
- **Tanstack React Query**: Data fetching and caching
- **Recharts & Chart.js**: Data visualization
- **Framer Motion**: Advanced animations
- **Lucide React**: Icon library

### Backend
- **Next.js 15**: Full-stack React framework
- **TypeScript**: Type safety
- **Clerk SDK for Next.js**: Authentication middleware
- **MongoDB with Mongoose**: Document database with ODM
- **Node.js**: JavaScript runtime

### Authentication & Security
- **Clerk**: Complete auth platform (sign-up, sign-in, 2FA, session management)
- **JWT Tokens**: Secure API authentication
- **Middleware**: Protected routes with Clerk middleware

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm or yarn**: Package manager
- **MongoDB Atlas Account**: Free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Clerk Account**: Free tier available at [clerk.com](https://clerk.com)
- **Git**: Version control

## 🚀 Quick Start

### 1. Get API Keys

**From Clerk:**
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Navigate to **API Keys**
4. Copy **Publishable Key** (pk_test_*) and **Secret Key** (sk_test_*)

**From MongoDB:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### 2. Clone Repository

```bash
git clone https://github.com/Yash-Bandal/Odyssey.git
cd Odyssey
```

### 3. Backend Setup (Next.js)

```bash
cd backend

# Install dependencies
npm install

# Create .env.local
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # macOS/Linux

# Edit .env.local with your keys:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
# CLERK_SECRET_KEY=sk_test_xxxxx
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/odyssey
# NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup (React + Vite)

```bash
cd frontend/health-dashboard

# Install dependencies
npm install

# Create .env.local
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # macOS/Linux

# Edit .env.local with:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 5. Run the Application

**Terminal 1 - Backend (http://localhost:5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (http://localhost:5173):**
```bash
cd frontend/health-dashboard
npm run dev
```

### 6. Access & Get Started

1. Open [http://localhost:5173](http://localhost:5173)
2. Sign up or sign in with Clerk
3. Complete onboarding and start tracking!

## 📁 Project Structure

```
Odyssey/
├── backend/                           # Next.js Backend API
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── health/           # Health check endpoint
│   │   │   │   ├── users/            # User initialization & profile
│   │   │   │   ├── streaks/          # Streak management & export
│   │   │   │   └── classroom/        # Classroom & gamification
│   │   │   │       ├── groups/       # Group CRUD operations
│   │   │   │       ├── quizzes/      # Quiz management
│   │   │   │       └── discussions/  # Discussion threads & replies
│   │   │   ├── layout.tsx            # Root layout with ClerkProvider
│   │   │   └── page.tsx              # API documentation
│   │   ├── lib/
│   │   │   └── mongodb.ts            # MongoDB connection utility
│   │   ├── models/
│   │   │   └── index.ts              # Mongoose schemas (15+ models)
│   │   └── middleware.ts             # Clerk authentication middleware
│   ├── .env.local                    # Environment variables (git-ignored)
│   ├── .env.example                  # Environment template
│   └── package.json
│
├── frontend/health-dashboard/        # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Classroom/            # Classroom-specific components
│   │   │   │   ├── TeacherView.jsx
│   │   │   │   ├── StudentView.jsx
│   │   │   │   ├── QuizCreator.jsx
│   │   │   │   ├── QuizTaker.jsx
│   │   │   │   ├── Leaderboard.jsx
│   │   │   │   └── DiscussionList.jsx
│   │   │   ├── Dashboard/
│   │   │   ├── NoDopamine/           # Gamification components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   ├── Classroom.jsx         # Classroom hub
│   │   │   ├── StudyManager.jsx
│   │   │   ├── ConsistencyTracker.jsx
│   │   │   ├── Workouts.jsx
│   │   │   ├── SignInPage.jsx        # Clerk sign-in
│   │   │   └── SignUpPage.jsx        # Clerk sign-up
│   │   ├── hooks/
│   │   │   ├── useStreakService.js   # API hook with auth
│   │   │   └── useTheme.js           # Dark mode hook
│   │   ├── services/
│   │   │   └── streakService.js      # API client with JWT
│   │   ├── App.jsx                   # Router & protected routes
│   │   └── main.jsx                  # React entry point
│   ├── .env.local                    # Environment variables (git-ignored)
│   ├── .env.example                  # Environment template
│   └── package.json
│
├── ARCHITECTURE.md                   # System architecture diagrams
├── IMPLEMENTATION_SUMMARY.md         # Auth implementation details
├── CLASSROOM_MODULE_README.md        # Classroom feature guide
├── ENV_SETUP_GUIDE.md               # Environment setup details
└── README.md                         # This file
```

## 🔐 Authentication Flow

```
User Browser → Clerk Sign-In/Sign-Up
    ↓
Clerk generates JWT Token
    ↓
Frontend stores token (Clerk SDK manages this)
    ↓
API Requests include: Authorization: Bearer <jwt_token>
    ↓
Backend Middleware validates JWT with Clerk
    ↓
User ID extracted from JWT claims
    ↓
Request granted access, user data retrieved from MongoDB
```

## 🌐 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check

### Protected Endpoints (Clerk JWT Required)

**User Management:**
- `POST /api/users` - Initialize/update user profile
- `GET /api/users/profile` - Get user profile

**Streaks & Stats:**
- `GET /api/streaks` - Get all streaks and stats
- `POST /api/streaks` - Create/update daily streak
- `POST /api/streaks/reset` - Reset all user data
- `GET /api/streaks/export` - Export user data as JSON

**Classroom - Groups:**
- `POST /api/classroom/groups` - Create group (teachers)
- `GET /api/classroom/groups` - Get user's groups
- `POST /api/classroom/groups/join` - Join group (students)
- `GET /api/classroom/groups/[groupId]/leaderboard` - Get leaderboard

**Classroom - Quizzes:**
- `POST /api/classroom/quizzes` - Create quiz
- `GET /api/classroom/quizzes` - Get group quizzes
- `POST /api/classroom/quizzes/[quizId]/submit` - Submit quiz answer
- `GET /api/classroom/quizzes/[quizId]/submissions` - Get submissions

**Classroom - Discussions:**
- `POST /api/classroom/discussions` - Create discussion thread
- `GET /api/classroom/discussions` - Get group discussions
- `POST /api/classroom/discussions/[threadId]/reply` - Reply to thread
- `GET /api/classroom/discussions/[threadId]/reply` - Get thread replies

## 🎮 Classroom & Gamification Guide

### For Teachers

1. **Create a Group**
   - Go to Classroom → Click "Create Group"
   - Share the 6-character code with students
   - Students use code to join

2. **Create Quizzes**
   - Select group → "Quizzes" tab
   - Add quiz questions (multiple choice)
   - Students earn +5 points per correct answer

3. **View Analytics**
   - Check leaderboard for student rankings
   - Monitor discussion engagement
   - Export student data

### For Students

1. **Join Classroom**
   - Go to Classroom → "Join Group"
   - Enter teacher-provided 6-character code
   - Get instant access to group content

2. **Participate & Earn Points**
   - **Quizzes**: +5 points per correct answer
   - **Discussion**: +5 points per reply
   - **Streaks**: Maintain consistency for badges

3. **Track Progress**
   - View your rank on group leaderboard
   - Check personal stats on dashboard
   - Unlock achievements

## 💾 Database Schema

### Core Models
- **User**: Profile, role (student/teacher), metadata
- **DailyStreak**: Date-based streak tracking
- **UserStats**: Aggregated points, streaks, milestones
- **Achievement**: Unlocked badges and achievements

### Classroom Models
- **Group**: Classroom group with students and points
- **Quiz**: Questions, options, and correct answers
- **QuizSubmission**: Student answers and scores
- **Discussion**: Thread topics and participants
- **DiscussionReply**: Thread responses

## 🔧 Development Commands

### Backend
```bash
cd backend

npm run dev       # Start development server (port 5000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run TypeScript and ESLint checks
npm run validate  # Validate setup
```

### Frontend
```bash
cd frontend/health-dashboard

npm run dev       # Start dev server (port 5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run check-config  # Verify Clerk config
```

## 🐛 Troubleshooting

### "Cannot find module" or Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Clerk Authentication Issues
- Verify `.env.local` exists in both backend and frontend
- Check keys start with correct prefix (`pk_test_` or `sk_test_`)
- Ensure Clerk app is enabled in dashboard
- Clear browser cookies and hard refresh

### MongoDB Connection Failed
- Verify connection string in `.env.local`
- Check database password (special characters need URL encoding)
- Confirm IP whitelist includes your machine in MongoDB Atlas
- Test connection: `mongosh "your-connection-string"`

### Port Already in Use
```bash
# Backend (Windows PowerShell)
Get-Process | Where-Object {$_.Port -eq 5000} | Stop-Process

# Frontend (Vite will auto-assign next available port)

# Or manually change port in package.json scripts
```

### CORS Errors
- Backend is configured to accept frontend requests
- If issues persist, check `NEXT_PUBLIC_FRONTEND_URL` matches actual frontend URL

### Data Not Persisting
- Verify MongoDB URI is correct and database is accessible
- Check user is properly authenticated (JWT token valid)
- Review browser console and server logs for errors

## 📊 Performance & Scalability

- **Indexed Queries**: MongoDB indexes on userId, groupId for fast lookups
- **JWT Caching**: Clerk handles token caching and refresh
- **React Query**: Automatic caching and request deduplication
- **Pagination**: Large datasets use cursor-based pagination
- **Real-time**: WebSocket support for live leaderboard updates (future)

## 🔒 Security Features

- **JWT Authentication**: Clerk-managed secure tokens
- **Middleware Protection**: All routes require valid JWT
- **HTTPS Ready**: Configured for production SSL
- **Environment Variables**: Secrets never in code
- **Input Validation**: Mongoose schema validation
- **CORS Configured**: Restricted to frontend origin

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup
- Install dependencies: `npm install`
- Follow the Quick Start guide above
- Run both backend and frontend in development mode
- Make changes and test thoroughly

## 📝 License

MIT License - Free to use for learning, personal, and commercial projects!

See LICENSE file for details.

## 🆘 Support & Community

- **Issues**: [GitHub Issues](https://github.com/Yash-Bandal/Odyssey/issues)
- **Documentation**: See ARCHITECTURE.md and related guides
- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)
- **MongoDB Docs**: [docs.mongodb.com](https://docs.mongodb.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **React Docs**: [react.dev](https://react.dev)

## 🙏 Acknowledgments

- **Clerk** - Seamless authentication platform
- **MongoDB** - Flexible document database
- **Next.js Team** - Full-stack React framework
- **React Community** - Amazing open-source ecosystem
- **Tailwind CSS** - Utility-first CSS framework
- **Vite Team** - Ultra-fast build tool
- All open-source contributors and maintainers

---

**Made with ❤️ for learners and educators everywhere**