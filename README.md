# Odyssey – WinternThon

Odyssey is a **full-stack productivity and collaborative learning platform** designed to help students and educators build consistency, track progress, and engage through gamified classrooms. It combines habit tracking, streaks, analytics, and classroom collaboration into a single unified system.



<br>


## Tech Stack

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


<br>


## Project Structure

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



<br>

<table>
  <tr>
    <td align="center" width="600">
 <img width="300"  alt="image" src="https://github.com/user-attachments/assets/60706c85-1301-451d-9d5a-e91e18d52e23" />
      <br>
      <b>Main Dashboard</b>
    </td>
    <td align="center" width="600">
     <img width="300"  alt="image" src="https://github.com/user-attachments/assets/2031ad28-6b0c-4089-b113-80e488b66eea" />
      <br>
      <b>Load Planner</b>
    </td>
  </tr>
</table>

<br>






##  Setup Instructions

###  Clone Repository

```bash
git clone https://github.com/Yash-Bandal/Odyssey.git
cd Odyssey
```


<br>


### Backend Setup

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


<br>


###  Frontend Setup (React + Vite)

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


<br>


## 7Authentication Flow

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


<br>


##  API Overview

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


<br>


## Classroom Workflow

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


<br>


##  License

MIT License – free to use for learning, personal, and commercial projects.




