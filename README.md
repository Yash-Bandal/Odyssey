# Odyssey – WinternThon

Odyssey is a **full-stack productivity and collaborative learning platform** designed to help students and educators build consistency, track progress, and engage through gamified classrooms. It combines habit tracking, streaks, analytics, and classroom collaboration into a single unified system.

---

## 1. Overview

Odyssey brings together **personal productivity** and **collaborative education** with gamification at its core.

### What Odyssey Solves

* Lack of consistency in study habits
* Low engagement in online classrooms
* Poor visibility into progress and performance
* Disconnected tools for productivity, learning, and wellness

### Core Pillars

* **Personal Productivity** – habits, streaks, goals
* **Collaborative Learning** – classrooms, quizzes, discussions
* **Gamification** – points, leaderboards, achievements
* **Analytics** – heatmaps, stats, progress tracking
* **Wellness Awareness** – study patterns and health insights

---

## 2. Key Features

### 2.1 Dashboard & Analytics

* Daily / Weekly / Monthly goal tracking
* Study streaks and consistency metrics
* Heatmap calendar for activity visualization
* Performance statistics and milestones

### 2.2 Classroom & Collaboration

* Teacher-created classrooms with join codes
* Quiz creation, submission, and grading
* Discussion forums for peer learning
* Real-time leaderboards within groups
* Live updates for scores and achievements

### 2.3 Gamification System

* Point-based reward system
* Classroom-level leaderboards
* Achievement badges for milestones
* Role-based access (Teacher / Student)

### 2.4 Productivity Tools

* Study session planner
* Workout and fitness tracking
* Daily consistency tracker
* Data export for personal analytics

### 2.5 User Experience

* Dark / Light mode toggle
* Fully responsive UI
* Smooth animations (Framer Motion)
* Secure authentication with Clerk

---

## 3. Tech Stack

### Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS
* React Router v7
* TanStack React Query
* Recharts & Chart.js
* Framer Motion
* Lucide Icons
* Clerk React SDK

### Backend

* Next.js 15
* Node.js
* TypeScript
* MongoDB with Mongoose
* Clerk SDK (Authentication)

### Authentication & Security

* Clerk (Sign-in, Sign-up, sessions, JWT)
* Protected API routes via middleware
* Secure environment variables

---

## 4. Project Structure

```
Odyssey/
├── backend/                         # Next.js backend
│   ├── src/
│   │   ├── app/api/                # API routes
│   │   │   ├── health/
│   │   │   ├── users/
│   │   │   ├── streaks/
│   │   │   └── classroom/
│   │   │       ├── groups/
│   │   │       ├── quizzes/
│   │   │       └── discussions/
│   │   ├── lib/                    # Utilities (MongoDB)
│   │   ├── models/                 # Mongoose schemas
│   │   └── middleware.ts           # Clerk auth middleware
│   └── package.json
│
├── frontend/health-dashboard/       # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── ARCHITECTURE.md
├── IMPLEMENTATION_SUMMARY.md
├── ENV_SETUP_GUIDE.md
└── README.md
```

---

## 5. Getting Started

### 5.1 Prerequisites

* Node.js v18+
* npm or yarn
* MongoDB Atlas account
* Clerk account
* Git

---

## 6. Setup Instructions

### 6.1 Clone Repository

```bash
git clone https://github.com/Yash-Bandal/Odyssey.git
cd Odyssey
```

---

### 6.2 Backend Setup (Next.js)

```bash
cd backend
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/odyssey
NEXT_PUBLIC_FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### 6.3 Frontend Setup (React + Vite)

```bash
cd frontend/health-dashboard
npm install
```

Create `.env.local`:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

Run frontend:

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

## 7. Authentication Flow

```
User → Clerk Sign-In / Sign-Up
 ↓
Clerk issues JWT
 ↓
Frontend sends JWT in Authorization header
 ↓
Backend middleware validates token
 ↓
User ID extracted and request processed
```

---

## 8. API Overview

### Public

* `GET /api/health`

### Protected (JWT Required)

**Users**

* `POST /api/users`
* `GET /api/users/profile`

**Streaks**

* `GET /api/streaks`
* `POST /api/streaks`
* `POST /api/streaks/reset`
* `GET /api/streaks/export`

**Classroom**

* `POST /api/classroom/groups`
* `POST /api/classroom/groups/join`
* `GET /api/classroom/groups`

**Quizzes**

* `POST /api/classroom/quizzes`
* `POST /api/classroom/quizzes/[quizId]/submit`

**Discussions**

* `POST /api/classroom/discussions`
* `POST /api/classroom/discussions/[threadId]/reply`

---

## 9. Classroom Workflow

### Teachers

* Create classroom groups
* Share join code
* Create quizzes
* Monitor leaderboards and engagement

### Students

* Join classrooms using code
* Attempt quizzes (+5 points)
* Participate in discussions (+5 points)
* Track rank and achievements

---

## 10. Development Commands

### Backend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 11. License

MIT License – free to use for learning, personal, and commercial projects.

---

## 12. Acknowledgements

* Clerk – Authentication platform
* MongoDB – Database
* Next.js – Full-stack framework
* React Community
* Tailwind CSS
* Vite

---

**Built for learners, educators, and consistency-driven growth.**
